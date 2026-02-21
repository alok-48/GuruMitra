const db = require('../config/database');
const { generateId } = require('../utils/helpers');

/**
 * Smart Reminder Engine
 * Uses behavior-based scheduling and missed-event detection
 * to adapt reminder timing for elderly users.
 */
class SmartReminderEngine {
  getAdherenceScore(userId) {
    const total = db.prepare(
      `SELECT COUNT(*) as total FROM medicine_logs WHERE user_id = ? AND created_at > datetime('now', '-30 days')`
    ).get(userId)?.total || 0;

    const taken = db.prepare(
      `SELECT COUNT(*) as taken FROM medicine_logs WHERE user_id = ? AND status = 'taken' AND created_at > datetime('now', '-30 days')`
    ).get(userId)?.taken || 0;

    return total > 0 ? (taken / total) : 1;
  }

  detectMissedPattern(userId) {
    const missed = db.prepare(`
      SELECT scheduled_time, strftime('%H', scheduled_time) as hour,
             strftime('%w', scheduled_time) as weekday
      FROM medicine_logs
      WHERE user_id = ? AND status = 'missed'
      AND created_at > datetime('now', '-14 days')
      ORDER BY scheduled_time DESC LIMIT 20
    `).all(userId);

    if (missed.length < 3) return null;

    const hourCounts = {};
    missed.forEach(m => {
      hourCounts[m.hour] = (hourCounts[m.hour] || 0) + 1;
    });

    const problematicHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (problematicHour && problematicHour[1] >= 3) {
      return {
        type: 'time_pattern',
        hour: parseInt(problematicHour[0]),
        missCount: problematicHour[1],
        suggestion: `${problematicHour[0]}:00 बजे दवाई अक्सर छूट जाती है। क्या समय बदलना चाहेंगे?`
      };
    }
    return null;
  }

  generateHealthAlerts(userId) {
    const alerts = [];
    const adherence = this.getAdherenceScore(userId);

    if (adherence < 0.7) {
      alerts.push({
        type: 'low_adherence',
        severity: adherence < 0.5 ? 'high' : 'medium',
        message: 'पिछले महीने कई दवाइयाँ छूट गई हैं। कृपया ध्यान दें।',
        adherencePercent: Math.round(adherence * 100)
      });
    }

    const recentMissed = db.prepare(`
      SELECT COUNT(*) as count FROM medicine_logs
      WHERE user_id = ? AND status = 'missed'
      AND created_at > datetime('now', '-3 days')
    `).get(userId)?.count || 0;

    if (recentMissed >= 3) {
      alerts.push({
        type: 'consecutive_missed',
        severity: 'high',
        message: 'पिछले 3 दिनों में कई दवाइयाँ छूटी हैं। परिवार को सूचित करें?',
        escalate: true
      });
    }

    return alerts;
  }

  getOptimalReminderTime(userId, baseTime) {
    const hour = parseInt(baseTime.split(':')[0]);
    const adherence = this.getAdherenceScore(userId);

    let reminderMinutesBefore = 15;
    if (adherence < 0.8) reminderMinutesBefore = 30;
    if (adherence < 0.6) reminderMinutesBefore = 45;

    const reminderHour = hour;
    const reminderMin = Math.max(0, parseInt(baseTime.split(':')[1] || 0) - reminderMinutesBefore);

    return {
      time: `${String(reminderHour).padStart(2, '0')}:${String(reminderMin).padStart(2, '0')}`,
      extraReminders: adherence < 0.7 ? 2 : 1,
      intervalMinutes: adherence < 0.7 ? 10 : 15
    };
  }

  createAdaptiveReminders(userId) {
    const medicines = db.prepare(
      'SELECT * FROM medicines WHERE user_id = ? AND is_active = 1'
    ).all(userId);

    const reminders = [];
    for (const med of medicines) {
      const times = med.times.split(',');
      for (const time of times) {
        const optimal = this.getOptimalReminderTime(userId, time.trim());
        const id = generateId();
        reminders.push({
          id,
          userId,
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          scheduledTime: time.trim(),
          reminderTime: optimal.time,
          extraReminders: optimal.extraReminders,
          intervalMinutes: optimal.intervalMinutes
        });
      }
    }
    return reminders;
  }
}

module.exports = new SmartReminderEngine();
