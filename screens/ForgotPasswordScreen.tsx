
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/storage';
import { Logo } from '../constants';

const ForgotPasswordScreen: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Identify, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Step 1: Query PostgreSQL to find User
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      setError('Please provide registered Email and Phone.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await db.verifyIdentity(email, phone);
      // Identity confirmed, now generate secure one-time code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setStep(2);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 15000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Local Verification of generated code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp && generatedOtp !== '') {
      setStep(3);
      setError('');
    } else {
      setError('Invalid security code. Please check your notification.');
    }
  };

  // Step 3: Atomic Update of Password in Database
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Security policy: Password must be 6+ characters.');
      return;
    }

    setLoading(true);
    try {
      await db.resetPassword(email, phone, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-8 justify-center animate-slide-up relative overflow-hidden">
      
      {/* Simulated System OTP Notification */}
      {showNotification && (
        <div className="fixed top-6 left-4 right-4 z-[100] bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in slide-in-from-top-full duration-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <i className="fas fa-lock-shield text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Security Gateway</p>
              <p className="text-sm font-bold">RECOVR Recovery Code: <span className="text-white text-xl tracking-[0.3em] font-mono ml-2">{generatedOtp}</span></p>
            </div>
          </div>
        </div>
      )}

      <Logo className="mb-12" />
      <h2 className="text-3xl font-black text-slate-900 mb-2">Access Recovery</h2>
      
      {/* Progress Wizard */}
      <div className="flex items-center space-x-2 mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full bg-indigo-600 transition-all duration-700 ${step >= i ? 'w-full' : 'w-0'}`}></div>
          </div>
        ))}
      </div>

      {success ? (
        <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center space-y-6 animate-in zoom-in">
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
            <i className="fas fa-check-double text-4xl"></i>
          </div>
          <h3 className="text-xl font-black text-emerald-900">Account Secured</h3>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest leading-relaxed">Identity confirmed. Updating your local vault and redirecting to login...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {step === 1 && (
            <form onSubmit={handleIdentify} className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Identity Match</p>
              <InputField label="Registered Email" icon="fa-envelope" type="email" value={email} onChange={setEmail} placeholder="email@company.com" />
              <InputField label="Mobile Number" icon="fa-phone" type="tel" value={phone} onChange={setPhone} placeholder="03XXXXXXXXX" maxLength={11} />
              <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all">
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Verify Credentials'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 2: Security Verification</p>
              <div className="flex justify-center">
                <input 
                  type="text" 
                  maxLength={4}
                  autoFocus
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-56 text-center text-5xl font-black tracking-[0.4em] py-6 bg-slate-50 border-b-4 border-indigo-600 outline-none text-slate-800 rounded-t-2xl"
                  placeholder="0000"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-8 italic">Check your device notification for the 4-digit security code.</p>
              <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all">
                Authorize Update
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-[9px] font-black text-slate-400 uppercase hover:text-indigo-600 transition-colors">Wrong Details? Go Back</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleReset} className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 3: Reset Credentials</p>
              <InputField label="New Password" icon="fa-lock" type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
              <InputField label="Confirm New Password" icon="fa-shield-check" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
              <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all">
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Update & Secure Vault'}
              </button>
            </form>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-2xl border border-rose-100 flex items-center shadow-sm">
              <i className="fas fa-triangle-exclamation mr-3 text-sm animate-pulse"></i> {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link to="/login" className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
          <i className="fas fa-arrow-left-long mr-1"></i> Back to Login
        </Link>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, type, value, onChange, placeholder, maxLength }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <div className="relative group">
      <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors`}></i>
      <input 
        type={type} 
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-100 outline-none transition-all font-bold text-slate-700"
        placeholder={placeholder}
        required
      />
    </div>
  </div>
);

export default ForgotPasswordScreen;
