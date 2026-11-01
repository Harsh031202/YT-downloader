import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  urlInput?: string;
  onUrlChange?: (value: string) => void;
  onAnalyze?: (url?: string) => void;
  isLoading?: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
}) => {
  return (
    <header className="h-16 px-8 flex items-center justify-between gap-6 bg-transparent select-none">
      {/* Feature / Status Badges directly inspired by the Teak navbar chips */}
      <div className="flex items-center gap-5 text-xs font-semibold text-[#544145]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#03af54] inline-block" />
          <span>yt-dlp Core</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#a6d4e7] inline-block" />
          <span>FFmpeg Codec</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff4eaf] inline-block" />
          <span>4K 60fps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ffab8d] inline-block" />
          <span>Lossless Mux</span>
        </div>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          onClick={onOpenSettings}
          className="relative w-10 h-10 rounded-full bg-white/90 border border-[#dfe0de] flex items-center justify-center text-[#544145] hover:text-[#2a0f14] hover:bg-white shadow-xs transition-all"
          title="Engine Status"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#fae261] rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Pill */}
        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-3 bg-white/90 pl-1.5 pr-4 py-1.5 rounded-full border border-[#dfe0de] shadow-xs cursor-pointer hover:border-[#2a0f14]/30 transition-all"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#2a0f14] text-[#fae261] flex items-center justify-center text-xs font-bold ring-2 ring-white">
            TF
          </div>
          <span className="text-xs font-bold text-[#2a0f14] tracking-tight">TubeFlow</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#766e70]" />
        </div>
      </div>
    </header>
  );
};
