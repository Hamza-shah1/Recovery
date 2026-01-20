
import React from 'react';

export const COLORS = {
  primary: '#4F46E5',
  secondary: '#6366F1',
  accent: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#0F172A',
  light: '#F8FAF8'
};

export const Logo = ({ className }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform hover:scale-105">
        <i className="fas fa-bolt-lightning"></i>
      </div>
    </div>
    <div className="mt-6 text-center">
      <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">RECOVR<span className="text-indigo-600">.</span></h1>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Intelligence Driven</p>
    </div>
  </div>
);
