/**
 * Document AI Module
 * Handles document categorization, auto-naming, and metadata extraction.
 * OCR integration point for production (Tesseract/Google Vision).
 */
class DocumentAI {
  constructor() {
    this.categoryPatterns = {
      identity: {
        keywords: ['aadhaar', 'aadhar', 'आधार', 'pan', 'पैन', 'voter', 'मतदाता', 'passport', 'पासपोर्ट', 'driving license'],
        filePatterns: ['aadhaar', 'pan_card', 'voter_id'],
      },
      pension: {
        keywords: ['pension', 'पेंशन', 'ppo', 'पीपीओ', 'gratuity', 'ग्रेच्युटी', 'commutation', 'retirement', 'सेवानिवृत्ति'],
        filePatterns: ['pension', 'ppo', 'retirement'],
      },
      medical: {
        keywords: ['medical', 'चिकित्सा', 'hospital', 'अस्पताल', 'prescription', 'नुस्खा', 'report', 'रिपोर्ट', 'health', 'स्वास्थ्य', 'blood', 'xray', 'x-ray'],
        filePatterns: ['medical', 'hospital', 'prescription', 'lab_report'],
      },
      property: {
        keywords: ['property', 'संपत्ति', 'land', 'भूमि', 'house', 'मकान', 'registry', 'रजिस्ट्री', 'deed'],
        filePatterns: ['property', 'land', 'registry'],
      },
      education: {
        keywords: ['education', 'शिक्षा', 'degree', 'डिग्री', 'certificate', 'प्रमाणपत्र', 'marksheet', 'अंकसूची'],
        filePatterns: ['degree', 'certificate', 'marksheet'],
      },
      legal: {
        keywords: ['legal', 'कानूनी', 'will', 'वसीयत', 'court', 'न्यायालय', 'affidavit', 'शपथपत्र', 'power of attorney'],
        filePatterns: ['legal', 'will', 'court', 'affidavit'],
      },
    };
  }

  categorizeDocument(filename, ocrText = '') {
    const combinedText = `${filename} ${ocrText}`.toLowerCase();

    let bestCategory = 'other';
    let bestScore = 0;

    for (const [category, config] of Object.entries(this.categoryPatterns)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      for (const pattern of config.filePatterns) {
        if (combinedText.includes(pattern.toLowerCase())) {
          score += 3;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore / 10, 1),
      suggestedName: this.generateName(bestCategory, filename),
    };
  }

  generateName(category, originalFilename) {
    const date = new Date().toISOString().split('T')[0];
    const categoryNames = {
      identity: 'पहचान पत्र',
      pension: 'पेंशन दस्तावेज़',
      medical: 'मेडिकल रिकॉर्ड',
      property: 'संपत्ति दस्तावेज़',
      education: 'शिक्षा प्रमाणपत्र',
      legal: 'कानूनी दस्तावेज़',
      other: 'अन्य दस्तावेज़',
    };
    return `${categoryNames[category] || 'दस्तावेज़'} - ${date}`;
  }

  extractExpiryDate(ocrText) {
    if (!ocrText) return null;
    const patterns = [
      /valid\s*(?:till|until|upto|up to)\s*[:\-]?\s*(\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4})/i,
      /expir(?:y|es|ation)\s*(?:date)?\s*[:\-]?\s*(\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4})/i,
      /(\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{4})\s*(?:तक|till)/i,
    ];

    for (const pattern of patterns) {
      const match = ocrText.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  suggestTags(category, ocrText = '') {
    const baseTags = {
      identity: ['पहचान', 'सरकारी ID'],
      pension: ['पेंशन', 'सेवानिवृत्ति', 'वित्तीय'],
      medical: ['स्वास्थ्य', 'चिकित्सा'],
      property: ['संपत्ति', 'भूमि'],
      education: ['शिक्षा', 'प्रमाणपत्र'],
      legal: ['कानूनी', 'विधिक'],
      other: ['अन्य'],
    };
    return baseTags[category] || baseTags.other;
  }
}

module.exports = new DocumentAI();
