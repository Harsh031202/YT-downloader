import React, { useState, useEffect } from 'react';
import { LiquidGlassLogo } from './liquid-glass-logo';
import { Moon, Sun, ArrowRight, RotateCcw } from 'lucide-react';

interface AppIntroProps {
  onComplete: () => void;
  initialTheme?: 'dark' | 'light';
}

export const AppIntro: React.FC<AppIntroProps> = ({ onComplete, initialTheme = 'dark' }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tubeflow_intro_theme');
    return (saved === 'light' || saved === 'dark') ? saved : initialTheme;
  });
  const [animKey, setAnimKey] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  // Auto transition after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 3200);

    return () => clearTimeout(timer);
  }, [animKey]);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('tubeflow_intro_theme', next);
    setAnimKey((prev) => prev + 1);
  };

  const handleReplay = () => {
    setAnimKey((prev) => prev + 1);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {/* Top Controls: Theme Toggle & Skip */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode intro`}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
            isDark
              ? 'bg-[#141416] text-[#E2E6EE] border-[#2A2B30] hover:bg-[#202226]'
              : 'bg-[#F5F6FA] text-[#1A1D1F] border-[#E5E8EF] hover:bg-[#ECEEF2]'
          }`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          <span>{isDark ? 'Light Version' : 'Dark Version'}</span>
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          title="Replay Liquid Glass Animation"
          className={`p-2 rounded-full text-xs font-bold transition-all border shadow-sm ${
            isDark
              ? 'bg-[#141416] text-[#A0A4AE] border-[#2A2B30] hover:text-white hover:bg-[#202226]'
              : 'bg-[#F5F6FA] text-[#6F767E] border-[#E5E8EF] hover:text-black hover:bg-[#ECEEF2]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Skip button */}
        <button
          onClick={handleFinish}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
            isDark
              ? 'bg-white text-black border-white hover:bg-[#E2E6EE]'
              : 'bg-[#1A1D1F] text-white border-[#1A1D1F] hover:bg-black'
          }`}
        >
          <span>Enter TubeFlow</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Liquid Glass Logo Animation */}
      <div className="w-full flex items-center justify-center relative">
        <LiquidGlassLogo
          key={animKey}
          logo="/logo.svg"
          ending="logo"
          theme={theme}
          style={{ height: 480, width: '100%', maxWidth: 720 }}
        />
      </div>

      {/* Subtle Bottom Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`text-[11px] font-bold tracking-[0.25em] uppercase transition-colors ${
            isDark ? 'text-white/40' : 'text-black/40'
          }`}
        >
          TubeFlow Desktop
        </span>
      </div>
    </div>
  );
};
