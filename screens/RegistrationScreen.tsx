
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/storage';
import { UserRole, User } from '../types';
import { Logo } from '../constants';

interface RegistrationScreenProps {
  onLogin: (u: User) => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.SALESMAN);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cnic: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAdminExists(api.checkAdminExists());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.cnic.length !== 13) {
      setError('CNIC must be exactly 13 digits.');
      setLoading(false);
      return;
    }

    try {
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        ...formData,
        role,
        createdAt: Date.now()
      };
      const registeredUser = await api.register(newUser);
      onLogin(registeredUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-8 justify-center animate-slide-up">
      {step === 1 ? (
        <div className="space-y-2">
          <Logo className="mb-10" />
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Enrollment</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Choose your platform access level</p>
          
          <div className="grid gap-4">
            {[
              { id: UserRole.SALESMAN, icon: 'fa-user-tie', title: 'Field Salesman', desc: 'Market recoveries & ledger' },
              { id: UserRole.CLIENT, icon: 'fa-store', title: 'Shop Owner', desc: 'Personal khata monitoring' },
              { id: UserRole.COMPANY, icon: 'fa-building', title: 'Company Admin', desc: 'Headquarters visibility' }
            ].map(r => {
              const disabled = r.id === UserRole.COMPANY && adminExists;
              return (
                <button 
                  key={r.id}
                  disabled={disabled}
                  onClick={() => setRole(r.id)}
                  className={`p-5 rounded-3xl text-left border-2 transition-all relative group ${
                    role === r.id 
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                      : disabled 
                        ? 'border-slate-50 bg-slate-50 opacity-60 grayscale cursor-not-allowed'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-all ${
                      role === r.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <i className={`fas ${r.icon} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">{r.title}</h3>
                        {disabled && <span className="bg-rose-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Slot Filled</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{r.desc}</p>
                    </div>
                    {role === r.id && <i className="fas fa-check-circle text-indigo-600 ml-auto text-lg"></i>}
                  </div>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full mt-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
          >
            Configure Profile
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(1)} className="mb-8 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center transition-colors">
            <i className="fas fa-chevron-left mr-2"></i> Back to roles
          </button>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Registration</h2>
          <p className="text-xs font-bold text-slate-400 mb-10 uppercase tracking-[0.2em] italic">
            Configuring: <span className="text-indigo-600 not-italic">{role}</span>
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <InputField icon="fa-user" placeholder="Full Legal Name" onChange={(v: string) => setFormData({...formData, name: v})} />
            <InputField icon="fa-envelope" type="email" placeholder="Contact Email" onChange={(v: string) => setFormData({...formData, email: v})} />
            <InputField icon="fa-phone" type="tel" placeholder="Phone (03xxxxxxxxx)" maxLength={11} onChange={(v: string) => setFormData({...formData, phone: v})} />
            <InputField icon="fa-id-card" placeholder="CNIC (13 Digits)" maxLength={13} onChange={(v: string) => setFormData({...formData, cnic: v})} />
            <InputField icon="fa-lock-open" type="password" placeholder="Access Password" onChange={(v: string) => setFormData({...formData, password: v})} />

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-2xl border border-rose-100 animate-pulse flex items-center">
                <i className="fas fa-shield-slash mr-2"></i> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Create Secure Profile'}
            </button>
          </form>
        </div>
      )}
      <div className="mt-12 text-center">
        <Link to="/login" className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
          Already Registered? Authorize Here
        </Link>
      </div>
    </div>
  );
};

const InputField = ({ icon, type = "text", placeholder, maxLength, onChange }: any) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
      <i className={`fas ${icon}`}></i>
    </div>
    <input 
      type={type} 
      placeholder={placeholder} 
      maxLength={maxLength}
      className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none font-bold text-sm transition-all text-slate-700"
      required
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default RegistrationScreen;
