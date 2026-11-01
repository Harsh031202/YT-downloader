import React from 'react';
import { 
  Home, 
  ArrowDownToLine, 
  MoreHorizontal, 
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'home' | 'downloads' | 'more';
  onSelectTab: (tab: 'home' | 'downloads' | 'more') => void;
  onOpenSettings: () => void;
  activeDownloadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  activeDownloadsCount,
}) => {
  return (
    <aside className="w-20 bg-[#f8faf7] border-r border-[#dfe0de] flex flex-col items-center py-6 justify-between select-none z-20 flex-shrink-0">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-8">
        <button 
          onClick={() => onSelectTab('home')}
          className="w-12 h-12 rounded-2xl bg-[#2a0f14] text-[#fae261] flex items-center justify-center shadow-md shadow-[#2a0f14]/20 hover:scale-105 active:scale-95 transition-all group"
          title="TubeFlow Home"
        >
          {/* Logo icon */}
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6 text-[#fae261] drop-shadow-xs" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-4">
          {/* Home Tab */}
          <button
            onClick={() => onSelectTab('home')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${
              currentTab === 'home'
                ? 'bg-[#2a0f14] text-[#fae261] shadow-md shadow-[#2a0f14]/25 scale-105'
                : 'text-[#766e70] hover:text-[#2a0f14] hover:bg-[#f0f2ef]'
            }`}
            title="Home - Downloader Hub"
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Downloads Tab */}
          <button
            onClick={() => onSelectTab('downloads')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${
              currentTab === 'downloads'
                ? 'bg-[#2a0f14] text-[#fae261] shadow-md shadow-[#2a0f14]/25 scale-105'
                : 'text-[#766e70] hover:text-[#2a0f14] hover:bg-[#f0f2ef]'
            }`}
            title="Downloads & History"
          >
            <ArrowDownToLine className="w-5 h-5 stroke-[2.2]" />
            {activeDownloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#fae261] text-[#2a0f14] text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-[#f8faf7] animate-pulse">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          {/* More Tab */}
          <button
            onClick={() => onSelectTab('more')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${
              currentTab === 'more'
                ? 'bg-[#2a0f14] text-[#fae261] shadow-md shadow-[#2a0f14]/25 scale-105'
                : 'text-[#766e70] hover:text-[#2a0f14] hover:bg-[#f0f2ef]'
            }`}
            title="More Options"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          </button>
        </nav>
      </div>

      {/* Bottom Settings */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#766e70] hover:text-[#2a0f14] hover:bg-[#f0f2ef] transition-all"
          title="App Settings & Engine Status"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </aside>
  );
};
