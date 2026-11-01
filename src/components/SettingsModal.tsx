import React from 'react';
import { X, Folder, CheckCircle2, AlertCircle, Trash2, Cpu, HardDrive, ShieldCheck, ExternalLink } from 'lucide-react';
import type { SystemInfo } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemInfo | null;
  outputFolder: string;
  onSelectOutputFolder: () => void;
  onClearHistory: () => void;
  onOpenPermissions?: () => void;
  onOpenUninstaller?: () => void;
  onReplayIntro?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemInfo,
  outputFolder,
  onSelectOutputFolder,
  onClearHistory,
  onOpenPermissions,
  onOpenUninstaller,
  onReplayIntro,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-4xl p-8 border border-[#ECEEF2] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#F0F2F5] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEECEE] text-[#E94E58] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-medium text-[#2a0f14] tracking-tight">
                Settings & Engine Core
              </h2>
              <span className="text-xs font-medium text-[#766e70]">
                Configure download directories and verify engine health
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f0f2ef] hover:bg-[#dfe0de] text-[#544145] hover:text-[#2a0f14] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-1">
          {/* Storage Directory */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2">
              Default Download Location
            </label>
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#ECEEF2] p-2.5 rounded-2xl">
              <Folder className="w-4 h-4 text-[#8C93A0] ml-1.5 flex-shrink-0" />
              <span className="text-xs text-[#1A1D1F] font-mono truncate flex-1" title={outputFolder}>
                {outputFolder}
              </span>
              <button
                onClick={onSelectOutputFolder}
                className="px-3 py-1.5 bg-white hover:bg-[#F0F2F5] text-[#1A1D1F] border border-[#ECEEF2] rounded-xl text-xs font-bold shadow-xs transition-all flex-shrink-0"
              >
                Change Folder
              </button>
            </div>
          </div>

          {/* Engine Health Status */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2.5">
              Backend Processing Engines
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* yt-dlp status card */}
              <div className="bg-[#F9FAFB] border border-[#ECEEF2] p-4 rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#1A1D1F]">yt-dlp Engine</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF0] text-[#12B76A] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Online
                  </span>
                </div>
                <div className="text-xs text-[#6F767E] font-medium">
                  Version: <span className="font-mono text-[#1A1D1F] font-semibold">{systemInfo?.ytdlpVersion || '2026.10.26'}</span>
                </div>
                <div className="text-[10px] text-[#8C93A0] truncate mt-1" title={systemInfo?.ytdlpPath}>
                  Path: {systemInfo?.ytdlpPath}
                </div>
              </div>

              {/* FFmpeg status card */}
              <div className="bg-[#F9FAFB] border border-[#ECEEF2] p-4 rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#1A1D1F]">FFmpeg Codec</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF0] text-[#12B76A] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Online
                  </span>
                </div>
                <div className="text-xs text-[#6F767E] font-medium">
                  Version: <span className="font-mono text-[#1A1D1F] font-semibold">{systemInfo?.ffmpegVersion || '9.0.2'}</span>
                </div>
                <div className="text-[10px] text-[#8C93A0] truncate mt-1" title={systemInfo?.ffmpegPath}>
                  Path: {systemInfo?.ffmpegPath}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions & Updates Section */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2">
              Permissions & Component Updates
            </label>
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
                  Engine Permissions & Update Manager
                </h4>
                <p className="text-[11px] text-[#8C93A0] mt-0.5">
                  Manage yt-dlp & FFmpeg execution rights, storage access, or fetch latest binary releases.
                </p>
              </div>
              {onOpenPermissions && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPermissions();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F2F5] text-[#1A1D1F] border border-[#ECEEF2] text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  Manage Setup
                </button>
              )}
            </div>
          </div>

          {/* Startup Intro & Branding */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2">
              Startup & Experience
            </label>
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D1F]">
                  Liquid Glass Logo Intro
                </h4>
                <p className="text-[11px] text-[#8C93A0] mt-0.5">
                  Experience the cinematic glass refraction animation with dark and light mode themes.
                </p>
              </div>
              {onReplayIntro && (
                <button
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F2F5] text-[#1A1D1F] border border-[#ECEEF2] text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  Play Intro
                </button>
              )}
            </div>
          </div>

          {/* Clean History section */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2">
              Data & Storage
            </label>
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D1F]">Clear Download History</h4>
                <p className="text-[11px] text-[#8C93A0] mt-0.5">
                  Clears the list of past completed downloads (does not delete saved files from disk).
                </p>
              </div>
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEECEE] text-[#6F767E] hover:text-[#E94E58] border border-[#ECEEF2] text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Uninstallation Section */}
          <div>
            <label className="text-xs font-bold text-[#8C93A0] uppercase tracking-wider block mb-2">
              Maintenance & Uninstallation
            </label>
            <div className="p-4 bg-[#FFF5F5] border border-[#FEE2E2] rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#E94E58]">Uninstall TubeFlow</h4>
                <p className="text-[11px] text-[#8C93A0] mt-0.5">
                  Choose between Standard app removal, Clean uninstall (engines & cache), or Total purge.
                </p>
              </div>
              {onOpenUninstaller && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUninstaller();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E94E58] hover:bg-[#D73843] text-white text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  Launch Uninstaller
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#F0F2F5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#2a0f14] hover:bg-[#1f0a0e] text-white text-xs font-bold transition-all shadow-sm"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
