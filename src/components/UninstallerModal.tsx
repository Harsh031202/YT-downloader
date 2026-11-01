import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2, Loader2, FolderX } from 'lucide-react';
import type { UninstallLevel } from '../types';

interface UninstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPerformUninstall: (level: UninstallLevel) => Promise<{ success: boolean; message: string }>;
  downloadDir: string;
}

export const UninstallerModal: React.FC<UninstallerModalProps> = ({
  isOpen,
  onClose,
  onPerformUninstall,
  downloadDir,
}) => {
  const [level, setLevel] = useState<UninstallLevel>('standard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmTotal, setConfirmTotal] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (level === 'total' && !confirmTotal) {
      alert('Please check the confirmation box to verify you want to delete all your downloaded videos and audio.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Executing uninstallation...');
    try {
      const res = await onPerformUninstall(level);
      setStatusMessage(res.message);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (err: any) {
      setStatusMessage('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-4xl p-8 border border-[#ECEEF2] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#F0F2F5] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEECEE] text-[#E94E58] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1D1F] tracking-tight">
                TubeFlow Uninstaller Setup
              </h2>
              <span className="text-xs font-semibold text-[#8C93A0]">
                Choose how thoroughly you want to remove TubeFlow from this system
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F6FA] hover:bg-[#E5E8EF] text-[#6F767E] hover:text-[#1A1D1F] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Uninstaller Options (The 3 exact choices) */}
        <div className="flex flex-col gap-3.5 mb-6 text-xs">
          {/* Option 1: Standard Removal */}
          <div
            onClick={() => setLevel('standard')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer ${
              level === 'standard'
                ? 'border-[#E94E58] bg-[#FFF8F8] ring-1 ring-[#E94E58]'
                : 'border-[#ECEEF2] bg-[#F9FAFB] hover:border-[#D5D9E2] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="uninstall-level"
                  checked={level === 'standard'}
                  onChange={() => setLevel('standard')}
                  className="text-[#E94E58] focus:ring-[#E94E58]"
                />
                <span className="font-extrabold text-sm text-[#1A1D1F]">
                  1. Remove this app only (Standard Uninstall)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8FAF0] text-[#12B76A]">
                Recommended
              </span>
            </div>
            <p className="text-[#6F767E] text-[11px] ml-6 leading-relaxed">
              Removes TubeFlow desktop client and shortcuts. <b>Keeps your downloaded videos, audio files, and download history intact.</b>
            </p>
          </div>

          {/* Option 2: Clean Uninstall */}
          <div
            onClick={() => setLevel('clean')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer ${
              level === 'clean'
                ? 'border-[#E94E58] bg-[#FFF8F8] ring-1 ring-[#E94E58]'
                : 'border-[#ECEEF2] bg-[#F9FAFB] hover:border-[#D5D9E2] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="uninstall-level"
                  checked={level === 'clean'}
                  onChange={() => setLevel('clean')}
                  className="text-[#E94E58] focus:ring-[#E94E58]"
                />
                <span className="font-extrabold text-sm text-[#1A1D1F]">
                  2. Clean uninstall (App + yt-dlp, FFmpeg, caches & libraries)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF7DC] text-[#B78103]">
                Clean State
              </span>
            </div>
            <p className="text-[#6F767E] text-[11px] ml-6 leading-relaxed">
              Removes TubeFlow app files, bundled yt-dlp & FFmpeg engines, application caches, and history. <b>Your downloaded videos folder is safely preserved.</b>
            </p>
          </div>

          {/* Option 3: Total Removal */}
          <div
            onClick={() => setLevel('total')}
            className={`p-4 rounded-3xl border transition-all cursor-pointer ${
              level === 'total'
                ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                : 'border-[#ECEEF2] bg-[#F9FAFB] hover:border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="uninstall-level"
                  checked={level === 'total'}
                  onChange={() => setLevel('total')}
                  className="text-red-600 focus:ring-red-600"
                />
                <span className="font-extrabold text-sm text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  3. Total removal (Complete purge including all downloaded videos & audio)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Wipes Everything
              </span>
            </div>
            <p className="text-[#6F767E] text-[11px] ml-6 leading-relaxed">
              Completely deletes EVERYTHING: the application, engine libraries, settings, AND permanently deletes all downloaded videos/audios in <span className="font-mono text-[#1A1D1F]">{downloadDir}</span>.
            </p>

            {level === 'total' && (
              <div className="mt-3 ml-6 pt-3 border-t border-red-200 flex items-center gap-2 text-red-700 font-bold">
                <input
                  type="checkbox"
                  id="confirm-total-box"
                  checked={confirmTotal}
                  onChange={(e) => setConfirmTotal(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                />
                <label htmlFor="confirm-total-box" className="cursor-pointer text-[11px]">
                  I understand this will permanently delete all my downloaded media files.
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-4 p-3 bg-[#F9FAFB] border border-[#ECEEF2] rounded-2xl text-xs font-semibold text-[#1A1D1F] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#F0F2F5] flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-[#8C93A0] hover:text-[#1A1D1F] transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={isProcessing || (level === 'total' && !confirmTotal)}
            className={`px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              level === 'total'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : 'bg-[#E94E58] hover:bg-[#D63C47] shadow-[#E94E58]/30'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {level === 'total'
                    ? 'Confirm Total Purge'
                    : level === 'clean'
                    ? 'Start Clean Uninstall'
                    : 'Start Standard Uninstall'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
