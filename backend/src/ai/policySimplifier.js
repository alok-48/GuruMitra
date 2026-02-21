/**
 * Policy Simplification Engine
 * Converts complex government policy text into simple Hindi explanations
 * with actionable bullet points.
 *
 * Uses rule-based simplification + template system.
 * Production version would integrate with LLM API (GPT/Gemini).
 */
class PolicySimplifier {
  constructor() {
    this.complexTerms = {
      'dearness allowance': 'महंगाई भत्ता (DA) - महंगाई बढ़ने पर मिलने वाली अतिरिक्त राशि',
      'gratuity': 'ग्रेच्युटी - सेवानिवृत्ति पर मिलने वाली एकमुश्त राशि',
      'commutation': 'कम्यूटेशन - पेंशन का एक हिस्सा एकमुश्त लेना',
      'pensioner': 'पेंशनभोगी - सेवानिवृत्त व्यक्ति',
      'arrears': 'बकाया राशि - पहले की जमा न हुई राशि',
      'revised': 'संशोधित - बदला हुआ / नया',
      'notification': 'अधिसूचना - सरकारी सूचना',
      'gazette': 'राजपत्र - सरकारी पत्र',
      'effective from': 'लागू होने की तारीख',
      'disbursement': 'वितरण - पैसे बाँटना',
      'compliance': 'पालन करना',
      'beneficiary': 'लाभार्थी - जिसे फायदा मिलेगा',
    };
  }

  simplify(text, category = 'general') {
    if (!text) return { simplified: '', bullets: [], glossary: [] };

    let simplified = text;

    const usedTerms = [];
    for (const [term, explanation] of Object.entries(this.complexTerms)) {
      if (simplified.toLowerCase().includes(term.toLowerCase())) {
        usedTerms.push({ term, explanation });
      }
    }

    const bullets = this.extractActionItems(text, category);
    const impact = this.assessImpact(text, category);
    const readingLevel = this.assessComplexity(text);

    return {
      simplified: this.makeSimpler(text),
      bullets,
      glossary: usedTerms,
      impact,
      complexity: readingLevel,
      whatChanged: this.extractChanges(text),
    };
  }

  makeSimpler(text) {
    let result = text;
    result = result.replace(/(?:it is )?hereby (?:notified|ordered|directed)/gi, '');
    result = result.replace(/in pursuance of/gi, 'के अनुसार');
    result = result.replace(/with effect from/gi, 'से लागू');
    result = result.replace(/the government has decided/gi, 'सरकार ने फैसला किया है');

    const sentences = result.split(/[.।]+/).filter(s => s.trim().length > 10);
    const important = sentences.filter(s =>
      /increase|decrease|amount|pension|date|deadline|submit|required/i.test(s)
    );

    return important.length > 0 ? important.join('। ') + '।' : result;
  }

  extractActionItems(text, category) {
    const actions = [];
    const lowerText = text.toLowerCase();

    if (/submit|जमा|file|भेजें/.test(lowerText)) {
      actions.push({ action: 'कोई दस्तावेज़ जमा करना है', priority: 'high' });
    }
    if (/deadline|last date|अंतिम तिथि/.test(lowerText)) {
      const dateMatch = text.match(/(\d{1,2}[\s/-]\w+[\s/-]\d{4})/);
      actions.push({
        action: `अंतिम तारीख: ${dateMatch ? dateMatch[1] : 'जल्द जांचें'}`,
        priority: 'high'
      });
    }
    if (/increase|बढ़ोतरी|hike/.test(lowerText)) {
      actions.push({ action: 'आपकी राशि में बढ़ोतरी हुई है - खाते में जांचें', priority: 'medium' });
    }
    if (/bank|बैंक/.test(lowerText)) {
      actions.push({ action: 'बैंक से संपर्क करें', priority: 'medium' });
    }

    if (actions.length === 0) {
      actions.push({ action: 'यह जानकारी के लिए है, अभी कुछ करने की ज़रूरत नहीं', priority: 'low' });
    }
    return actions;
  }

  assessImpact(text, category) {
    const lowerText = text.toLowerCase();
    if (/increase|hike|benefit|बढ़ोतरी|लाभ/.test(lowerText)) return 'positive';
    if (/decrease|stop|discontinue|reduce|कमी/.test(lowerText)) return 'negative';
    if (/deadline|required|mandatory|अनिवार्य/.test(lowerText)) return 'action_needed';
    return 'informational';
  }

  assessComplexity(text) {
    const words = text.split(/\s+/).length;
    const longWords = text.split(/\s+/).filter(w => w.length > 10).length;
    const ratio = longWords / words;
    if (ratio > 0.3) return 'complex';
    if (ratio > 0.15) return 'moderate';
    return 'simple';
  }

  extractChanges(text) {
    const changes = [];
    const fromToPattern = /from\s+(\d+%?)\s+to\s+(\d+%?)/gi;
    let match;
    while ((match = fromToPattern.exec(text)) !== null) {
      changes.push({ from: match[1], to: match[2] });
    }
    return changes;
  }
}

module.exports = new PolicySimplifier();
