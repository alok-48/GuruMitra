import { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError('कृपया 10 अंकों का फ़ोन नंबर डालें'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post('/auth/send-otp', { phone });
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep('otp');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('कृपया 6 अंकों का OTP डालें'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post('/auth/verify-otp', { phone, otp });
      login(data.token, data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-500 via-primary-400 to-warm-100 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-5xl">🎓</span>
        </div>
        <h1 className="text-elder-3xl font-bold text-white mb-2">गुरुमित्र</h1>
        <p className="text-elder-base text-white/90">सेवानिवृत्त शिक्षकों का विश्वसनीय साथी</p>
      </div>

      <div className="card w-full max-w-md p-8">
        {step === 'phone' ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Phone size={28} className="text-saffron-500" />
              <h2 className="text-elder-xl font-bold">अपना फ़ोन नंबर डालें</h2>
            </div>
            <div className="mb-6">
              <label className="label-elder" htmlFor="phone">मोबाइल नंबर</label>
              <div className="flex gap-2">
                <span className="flex items-center px-4 bg-gray-100 rounded-elder text-elder-lg font-medium text-gray-600">+91</span>
                <input
                  id="phone" type="tel" inputMode="numeric" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="input-elder flex-1" placeholder="98765 43210"
                  aria-label="10 अंकों का मोबाइल नंबर"
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-elder-sm mb-4 font-medium" role="alert">{error}</p>}
            <button onClick={handleSendOTP} disabled={loading} className="btn-primary w-full">
              {loading ? 'भेज रहे हैं...' : 'OTP भेजें'} <ArrowRight size={22} />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={28} className="text-saffron-500" />
              <h2 className="text-elder-xl font-bold">OTP डालें</h2>
            </div>
            <p className="text-elder-sm text-gray-600 mb-4">+91 {phone} पर भेजा गया OTP डालें</p>
            {devOtp && (
              <div className="bg-blue-50 border border-blue-200 rounded-elder p-3 mb-4">
                <p className="text-blue-700 text-elder-sm font-medium">Demo OTP: <strong className="text-elder-lg">{devOtp}</strong></p>
              </div>
            )}
            <div className="mb-6">
              <input
                type="tel" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input-elder text-center text-elder-2xl tracking-[0.5em]"
                placeholder="------"
                aria-label="6 अंकों का OTP"
                autoFocus
              />
            </div>
            {error && <p className="text-red-600 text-elder-sm mb-4 font-medium" role="alert">{error}</p>}
            <button onClick={handleVerifyOTP} disabled={loading} className="btn-primary w-full mb-4">
              {loading ? 'जांच रहे हैं...' : 'पुष्टि करें'} <ShieldCheck size={22} />
            </button>
            <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="btn-secondary w-full">
              नंबर बदलें
            </button>
          </>
        )}
      </div>

      <p className="text-white/70 text-sm mt-8 text-center">
        आपकी जानकारी पूरी तरह सुरक्षित है 🔒
      </p>
    </div>
  );
}
