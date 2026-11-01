import React from 'react';
import { MoreHorizontal, Terminal, Sliders, Layers } from 'lucide-react';

export const MoreView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-8 lg:px-14 pb-16 pt-4 select-none">
      <div className="max-w-4xl mx-auto py-6">
        {/* Top Header */}
        <div className="mb-10 pb-6 border-b border-[#dfe0de]">
          <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#2a0f14]">
            More Tools
          </h1>
          <p className="font-sans text-sm text-[#544145] mt-1 font-normal">
            Experimental features, batch processing, and custom FFmpeg tooling.
          </p>
        </div>

        {/* Clean Open Canvas (Cardless) */}
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#fae261] text-[#2a0f14] flex items-center justify-center mb-6 shadow-sm">
            <MoreHorizontal className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h2 className="font-display text-3xl font-medium text-[#2a0f14] tracking-tight mb-3">
            Expansion Hub
          </h2>

          <p className="font-sans text-sm text-[#544145] leading-relaxed max-w-md mb-8">
            This module is reserved for upcoming workflow extensions: Playlist batch downloads, automated channel monitors, subtitle translation, and advanced FFmpeg audio filters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-white/80 border border-[#dfe0de] text-xs font-semibold text-[#544145] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#03af54]" />
              <span>Playlist Batch Muxer</span>
            </span>

            <span className="px-4 py-2 rounded-full bg-white/80 border border-[#dfe0de] text-xs font-semibold text-[#544145] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#a6d4e7]" />
              <span>Channel Sync Watcher</span>
            </span>

            <span className="px-4 py-2 rounded-full bg-white/80 border border-[#dfe0de] text-xs font-semibold text-[#544145] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff4eaf]" />
              <span>AI Subtitles & Whisper</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
