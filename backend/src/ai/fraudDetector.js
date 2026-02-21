/**
 * Safety & Fraud Alert AI
 * Hybrid rule + pattern-based detection for common scams targeting elderly.
 */
class FraudDetector {
  constructor() {
    this.scamPatterns = [
      { pattern: /OTP|ओटीपी.*share|बताइए|बताएं/i, type: 'otp_scam', severity: 'critical' },
      { pattern: /bank.*call.*verify|बैंक.*कॉल.*जांच/i, type: 'bank_impersonation', severity: 'high' },
      { pattern: /lottery|लॉटरी|jackpot|जैकपॉट/i, type: 'lottery_scam', severity: 'high' },
      { pattern: /KYC.*expire|केवाईसी.*बंद/i, type: 'kyc_scam', severity: 'high' },
      { pattern: /insurance.*claim|बीमा.*क्लेम.*मिल/i, type: 'insurance_scam', severity: 'medium' },
      { pattern: /link.*click|लिंक.*क्लिक/i, type: 'phishing', severity: 'medium' },
      { pattern: /transfer.*money.*(?:urgent|immediately)|पैसे.*(?:तुरंत|जल्दी).*भेजें/i, type: 'money_transfer_scam', severity: 'critical' },
      { pattern: /government.*scheme.*(?:free|मुफ्त)/i, type: 'fake_scheme', severity: 'medium' },
      { pattern: /(?:arrested|गिरफ्तार).*(?:police|पुलिस)/i, type: 'police_impersonation', severity: 'high' },
    ];

    this.scamDescriptions = {
      otp_scam: 'कोई भी बैंक या सरकारी कर्मचारी कभी OTP नहीं माँगता। यह धोखाधड़ी है।',
      bank_impersonation: 'बैंक कभी फ़ोन पर खाते की जानकारी नहीं माँगता। शाखा में जाकर जांच करें।',
      lottery_scam: 'बिना खेले लॉटरी नहीं लगती। यह ठगी का तरीका है।',
      kyc_scam: 'KYC के लिए बैंक शाखा जाएं। फ़ोन पर कोई KYC नहीं होती।',
      insurance_scam: 'बीमा क्लेम के लिए पहले पैसे नहीं देने होते। यह ठगी हो सकती है।',
      phishing: 'अनजान लिंक पर क्लिक न करें। यह आपकी जानकारी चुरा सकता है।',
      money_transfer_scam: 'किसी को तुरंत पैसे न भेजें। पहले परिवार से बात करें।',
      fake_scheme: 'सरकारी योजनाओं की जांच आधिकारिक वेबसाइट पर करें।',
      police_impersonation: 'पुलिस फ़ोन पर गिरफ्तारी की धमकी नहीं देती। यह ठगी है।',
    };
  }

  analyzeMessage(text) {
    if (!text) return { isSafe: true, alerts: [] };

    const alerts = [];
    for (const { pattern, type, severity } of this.scamPatterns) {
      if (pattern.test(text)) {
        alerts.push({
          type,
          severity,
          description: this.scamDescriptions[type],
          matchedText: text.match(pattern)?.[0],
        });
      }
    }

    return {
      isSafe: alerts.length === 0,
      alerts,
      riskScore: this.calculateRiskScore(alerts),
      advice: alerts.length > 0
        ? 'सावधान! यह संदेश संदिग्ध है। कृपया किसी को भी अपनी निजी जानकारी न दें।'
        : null,
    };
  }

  analyzePensionPattern(userId, payments) {
    if (!payments || payments.length < 3) return { isNormal: true };

    const amounts = payments.map(p => p.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const latestAmount = amounts[0];

    const anomalies = [];

    if (Math.abs(latestAmount - avgAmount) > avgAmount * 0.2) {
      anomalies.push({
        type: 'amount_deviation',
        message: `इस महीने की पेंशन राशि सामान्य से ${latestAmount > avgAmount ? 'ज़्यादा' : 'कम'} है।`,
        expected: avgAmount,
        actual: latestAmount,
      });
    }

    const dates = payments.map(p => new Date(p.credited_date).getDate());
    const avgDate = Math.round(dates.reduce((a, b) => a + b, 0) / dates.length);
    const latestDate = dates[0];
    if (Math.abs(latestDate - avgDate) > 5) {
      anomalies.push({
        type: 'date_deviation',
        message: 'पेंशन सामान्य तारीख से देर से आई है।',
        expectedDate: avgDate,
        actualDate: latestDate,
      });
    }

    return {
      isNormal: anomalies.length === 0,
      anomalies,
    };
  }

  calculateRiskScore(alerts) {
    const weights = { critical: 40, high: 25, medium: 15, low: 5 };
    return Math.min(alerts.reduce((sum, a) => sum + (weights[a.severity] || 5), 0), 100);
  }
}

module.exports = new FraudDetector();
