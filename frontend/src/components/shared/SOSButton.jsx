import { useState } from 'react';
import { Phone } from 'lucide-react';
import api from '../../services/api';

export default function SOSButton({ size = 'normal' }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSOS = async () => {
    if (sending || sent) return;
    const confirmed = window.confirm('क्या आप SOS भेजना चाहते हैं? आपातकालीन मदद भेजी जाएगी।');
    if (!confirmed) return;

    setSending(true);
    try {
      await api.post('/help/sos', { description: 'SOS - आपातकालीन मदद चाहिए' });
      setSent(true);
      setTimeout(() => setSent(false), 10000);
    } catch (e) {
      alert('SOS भेजने में समस्या हुई। कृपया 112 पर कॉल करें।');
    } finally {
      setSending(false);
    }
  };

  if (size === 'large') {
    return (
      <button
        onClick={handleSOS}
        disabled={sending}
        className={`w-full py-6 rounded-elder text-elder-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
          sent ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
        }`}
        aria-label="आपातकालीन SOS भेजें"
      >
        <Phone size={36} />
        {sent ? '✅ मदद भेजी गई!' : sending ? 'भेज रहे हैं...' : '🆘 मुझे मदद चाहिए!'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSOS}
      disabled={sending}
      className={`btn-danger ${sent ? 'bg-green-600' : ''}`}
      aria-label="SOS"
    >
      <Phone size={22} />
      {sent ? '✅ भेजी गई!' : '🆘 SOS'}
    </button>
  );
}
