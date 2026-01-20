
import React from 'react';
import { Logo } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Logo className="mb-12 animate-pulse" />
      <div className="w-12 h-1 bg-indigo-100 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-indigo-600 w-1/2 animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { left: -100%; width: 100%; }
          100% { left: 100%; width: 100%; }
        }
      `}</style>
      <p className="mt-8 text-sm font-medium text-gray-400">Verifying secure session...</p>
    </div>
  );
};

export default SplashScreen;
