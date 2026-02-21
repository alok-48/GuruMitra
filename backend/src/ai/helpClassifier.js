/**
 * Help Request AI - Intent Classification & Priority Scoring
 * Classifies help requests into categories and assigns urgency levels.
 */
class HelpClassifier {
  constructor() {
    this.categoryKeywords = {
      health: {
        hi: ['दर्द', 'बीमार', 'अस्पताल', 'दवाई', 'डॉक्टर', 'तबीयत', 'खून', 'बेहोश', 'सांस', 'चक्कर', 'बुखार', 'गिर गया', 'एम्बुलेंस'],
        en: ['pain', 'sick', 'hospital', 'medicine', 'doctor', 'health', 'blood', 'unconscious', 'breathing', 'dizzy', 'fever', 'fell', 'ambulance', 'emergency'],
      },
      bank: {
        hi: ['पेंशन', 'बैंक', 'पैसा', 'खाता', 'ATM', 'चेक', 'जमा', 'निकासी', 'फ्रॉड', 'ठगी'],
        en: ['pension', 'bank', 'money', 'account', 'ATM', 'check', 'deposit', 'withdrawal', 'fraud', 'scam'],
      },
      document: {
        hi: ['दस्तावेज़', 'कागज़', 'फॉर्म', 'प्रमाणपत्र', 'आधार', 'पैन', 'जमा करना', 'फाइल'],
        en: ['document', 'paper', 'form', 'certificate', 'aadhaar', 'pan', 'submit', 'file'],
      },
      transport: {
        hi: ['गाड़ी', 'यात्रा', 'जाना', 'अस्पताल जाना', 'बैंक जाना', 'सवारी', 'ऑटो', 'टैक्सी'],
        en: ['vehicle', 'travel', 'go', 'ride', 'auto', 'taxi', 'transport', 'cab'],
      },
    };

    this.emergencyPatterns = [
      /एम्बुलेंस|ambulance/i,
      /बेहोश|unconscious|faint/i,
      /सांस नहीं|can't breathe|breathing/i,
      /गिर गय|fell down|fallen/i,
      /chest pain|सीने में दर्द/i,
      /heart|दिल का दौरा/i,
      /stroke|लकवा/i,
      /accident|दुर्घटना/i,
    ];
  }

  classify(text) {
    if (!text) return { category: 'general', urgency: 'normal', confidence: 0 };

    const lowerText = text.toLowerCase();

    const isEmergency = this.emergencyPatterns.some(p => p.test(lowerText));
    if (isEmergency) {
      return {
        category: 'emergency',
        urgency: 'critical',
        confidence: 0.95,
        message: 'यह आपातकालीन स्थिति है। तुरंत मदद भेजी जा रही है।',
      };
    }

    const scores = {};
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      scores[category] = 0;
      for (const lang of ['hi', 'en']) {
        for (const keyword of keywords[lang]) {
          if (lowerText.includes(keyword.toLowerCase())) {
            scores[category] += 1;
          }
        }
      }
    }

    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const topCategory = sorted[0][1] > 0 ? sorted[0][0] : 'general';
    const topScore = sorted[0][1];

    const urgency = this.assessUrgency(lowerText, topCategory, topScore);

    return {
      category: topCategory,
      urgency,
      confidence: Math.min(topScore / 5, 1),
      scores,
    };
  }

  assessUrgency(text, category, score) {
    const urgentWords = ['तुरंत', 'जल्दी', 'urgent', 'immediately', 'अभी', 'now', 'help', 'मदद'];
    const hasUrgentWord = urgentWords.some(w => text.includes(w));

    if (category === 'health' && (score >= 3 || hasUrgentWord)) return 'high';
    if (hasUrgentWord) return 'high';
    if (category === 'health') return 'high';
    if (score >= 3) return 'normal';
    return 'normal';
  }

  getPriorityScore(request) {
    const weights = {
      urgency: { critical: 100, high: 75, normal: 40, low: 10 },
      category: { emergency: 50, health: 40, bank: 25, document: 15, transport: 20, general: 10 },
    };

    const urgencyScore = weights.urgency[request.urgency] || 40;
    const categoryScore = weights.category[request.category] || 10;
    let ageBonus = 0;
    if (request.userAge && request.userAge > 75) ageBonus = 15;

    return Math.min(urgencyScore + categoryScore + ageBonus, 100);
  }
}

module.exports = new HelpClassifier();
