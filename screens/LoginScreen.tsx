
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/storage';
import { Logo } from '../constants';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (u: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.login(identifier, password);
      onLogin(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-10 justify-center animate-slide-up relative overflow-hidden">
      {/* Mesh Background Blurs */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-violet-50 rounded-full blur-[100px] opacity-60"></div>

      <div className="relative z-10">
        <Logo className="mb-14" />
        
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Gateway</h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
            <span className="w-8 h-[2px] bg-indigo-500 mr-3"></span> Verified Access Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Key</label>
            <div className="relative group">
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-6 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-700 text-lg"
                placeholder="Identity / Email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret</label>
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Forgot?</Link>
            </div>
            <div className="relative group">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-6 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-700 text-lg"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-2xl flex items-center border border-rose-100 animate-pulse">
              <i className="fas fa-shield-halved mr-3 text-lg"></i> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-[11px] mt-4"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Authorize Login'}
          </button>
        </form>

        <div className="mt-14 text-center">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
            Need access? {' '}
            <Link to="/register" className="text-indigo-600 hover:underline">Enrollment Hub</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
