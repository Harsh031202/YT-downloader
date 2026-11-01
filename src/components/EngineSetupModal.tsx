import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, AlertTriangle, Loader2, Cpu, Film, Music2, RefreshCw, X } from 'lucide-react';
import type { SystemInfo } from '../types';

interface EngineSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemInfo | null;
  onRefreshSystemInfo: () => Promise<SystemInfo | null>;
  isAutoTriggered?: boolean;
}

export const EngineSetupModal: React.FC<EngineSetupModalProps> = ({
  isOpen,
  onClose,
  systemInfo,
  onRefreshSystemInfo,
  isAutoTriggered = false,
}) => {
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installLog, setInstallLog] = useState<string>('');
  const [installStatus, setInstallStatus] = useState<string>('Ready to configure core engines.');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to log events
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.onEngineInstallLog) {
      const unsub = window.electronAPI.onEngineInstallLog((log) => {
        setInstallLog((prev) => prev + '\n' + log);
        if (log.includes('yt-dlp')) {
          setInstallStatus('Configuring yt-dlp binary (latest release)...');
        } else if (log.includes('FFmpeg') || log.includes('ffmpeg')) {
          setInstallStatus('Configuring FFmpeg codecs & audio muxer...');
        }
      });
      return unsub;
    }
  }, []);

  const handleStartInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    setErrorMessage(null);
    setInstallStatus('Connecting to official engine sources...');

    try {
      if (window.electronAPI?.installCoreEngines) {
        const res = await window.electronAPI.installCoreEngines();
        if (res.success) {
          setIsSuccess(true);
          setInstallStatus('Both engines successfully configured!');
          const updated = await onRefreshSystemInfo();
          setTimeout(() => {
            if (updated?.isYtdlpReady && updated?.isFfmpegReady) {
              onClose();
            }
          }, 1800);
        } else {
          setErrorMessage('Setup encountered an issue: ' + (res.log || 'Could not verify engine binaries'));
        }
      } else {
        // Browser fallback / demo mode
        setTimeout(() => {
          setIsSuccess(true);
          setIsInstalling(false);
          setInstallStatus('Engines simulated successfully.');
          setTimeout(onClose, 1200);
        }, 2000);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to download core engines.');
    } finally {
      setIsInstalling(false);
    }
  };

  // Auto-start download if engines are missing
  useEffect(() => {
    if (isOpen && (!systemInfo?.isYtdlpReady || !systemInfo?.isFfmpegReady) && !isInstalling && !isSuccess) {
      handleStartInstall();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ytdlpReady = systemInfo?.isYtdlpReady || isSuccess;
  const ffmpegReady = systemInfo?.isFfmpegReady || isSuccess;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-4xl p-8 border border-[#dfe0de] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#dfe0de] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fae261] text-[#2a0f14] flex items-center justify-center font-bold shadow-xs">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-display font-medium text-[#2a0f14] tracking-tight">
                Core Engines Setup
              </h2>
              <span className="text-xs text-[#766e70] font-normal">
                Installing yt-dlp & FFmpeg for 4K video streams & audio muxing
              </span>
            </div>
          </div>

          {!isAutoTriggered && (
            <button
              onClick={onClose}
              disabled={isInstalling}
              className="w-9 h-9 rounded-full bg-[#f0f2ef] hover:bg-[#e4e7e2] text-[#544145] hover:text-[#2a0f14] flex items-center justify-center transition-all disabled:opacity-40"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* Engine Status Cards */}
        <div className="space-y-3 mb-6">
          {/* Card 1: yt-dlp */}
          <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#dfe0de] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#dfe0de] flex items-center justify-center text-[#2a0f14]">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2a0f14]">yt-dlp Engine</h4>
                <p className="text-[11px] text-[#766e70]">
                  Video extraction core (latest release)
                </p>
              </div>
            </div>

            <div>
              {ytdlpReady ? (
                <span className="px-3 py-1 rounded-full bg-[#d7f8e6] text-[#03af54] text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </span>
              ) : isInstalling ? (
                <span className="px-3 py-1 rounded-full bg-[#fae261]/40 text-[#2a0f14] text-xs font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#fee4e2] text-[#d92d20] text-xs font-bold">
                  Missing
                </span>
              )}
            </div>
          </div>

          {/* Card 2: FFmpeg */}
          <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#dfe0de] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#dfe0de] flex items-center justify-center text-[#2a0f14]">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2a0f14]">FFmpeg Codecs & Muxer</h4>
                <p className="text-[11px] text-[#766e70]">
                  4K video muxing & lossless audio conversion
                </p>
              </div>
            </div>

            <div>
              {ffmpegReady ? (
                <span className="px-3 py-1 rounded-full bg-[#d7f8e6] text-[#03af54] text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </span>
              ) : isInstalling ? (
                <span className="px-3 py-1 rounded-full bg-[#fae261]/40 text-[#2a0f14] text-xs font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#fee4e2] text-[#d92d20] text-xs font-bold">
                  Missing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Progress Bar & Status */}
        <div className="mb-6 bg-white/80 border border-[#dfe0de] rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#2a0f14] flex items-center gap-2">
              {isInstalling && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2a0f14]" />}
              <span>{installStatus}</span>
            </span>
            {isSuccess && (
              <span className="text-[#03af54] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Complete</span>
              </span>
            )}
          </div>

          <div className="w-full bg-[#f0f2ef] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSuccess
                  ? 'w-full bg-[#03af54]'
                  : isInstalling
                  ? 'w-3/4 bg-[#fae261] animate-pulse'
                  : 'w-0 bg-[#fae261]'
              }`}
            />
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-[#fee4e2] border border-[#fecdca] text-[#d92d20] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {(!ytdlpReady || !ffmpegReady) && (
            <button
              onClick={handleStartInstall}
              disabled={isInstalling}
              className="px-6 py-3 rounded-full bg-[#fae261] hover:bg-[#f9e47d] active:bg-[#e6bf24] text-[#2a0f14] font-display font-medium text-sm transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Engines...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Download & Install Engines</span>
                </>
              )}
            </button>
          )}

          {ytdlpReady && ffmpegReady && (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-[#2a0f14] hover:bg-[#401c23] text-white font-display font-medium text-sm transition-all shadow-xs"
            >
              Start TubeFlow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
