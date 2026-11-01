import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Download, AlertTriangle, X, RefreshCw, Cpu, HardDrive } from 'lucide-react';
import type { AppPermissions, SystemInfo } from '../types';

interface PermissionsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: AppPermissions;
  onSavePermissions: (perms: AppPermissions) => void;
  systemInfo: SystemInfo | null;
  onUpdateYtdlp: () => Promise<{ success: boolean; message: string }>;
}

export const PermissionsSetupModal: React.FC<PermissionsSetupModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onSavePermissions,
  systemInfo,
  onUpdateYtdlp,
}) => {
  const [perms, setPerms] = useState<AppPermissions>(permissions);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateMsg('Connecting to GitHub releases & updating yt-dlp binary...');
    try {
      const res = await onUpdateYtdlp();
      setUpdateMsg(res.message);
    } catch (e: any) {
      setUpdateMsg('Update failed: ' + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = () => {
    onSavePermissions(perms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-4xl p-8 border border-[#ECEEF2] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#F0F2F5] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8FAF0] text-[#12B76A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1D1F] tracking-tight">
                Permissions & Component Setup
              </h2>
              <span className="text-xs font-semibold text-[#8C93A0]">
                Configure desktop runtime access and verify backend engines
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

        {/* Modal Body */}
        <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1 text-xs">
          {/* Permission Checklist */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-[#8C93A0] uppercase tracking-wider block">
              Required System Permissions
            </span>

            {/* Item 1: Engine Execution */}
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-start gap-3.5">
              <input
                type="checkbox"
                id="perm-ytdlp"
                checked={perms.ytdlpPermitted}
                onChange={(e) => setPerms({ ...perms, ytdlpPermitted: e.target.checked })}
                className="mt-1 w-4 h-4 text-[#E94E58] rounded border-gray-300 focus:ring-[#E94E58]"
              />
              <div className="flex-1">
                <label htmlFor="perm-ytdlp" className="font-bold text-[#1A1D1F] block cursor-pointer">
                  Permission to execute yt-dlp & FFmpeg engines
                </label>
                <p className="text-[#6F767E] text-[11px] mt-0.5 leading-relaxed">
                  Allows TubeFlow to spawn yt-dlp and FFmpeg background child processes for 4K video streams, high-fidelity audio extraction, and metadata inspection.
                </p>
              </div>
            </div>

            {/* Item 2: Storage Access */}
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-start gap-3.5">
              <input
                type="checkbox"
                id="perm-storage"
                checked={perms.storagePermitted}
                onChange={(e) => setPerms({ ...perms, storagePermitted: e.target.checked })}
                className="mt-1 w-4 h-4 text-[#E94E58] rounded border-gray-300 focus:ring-[#E94E58]"
              />
              <div className="flex-1">
                <label htmlFor="perm-storage" className="font-bold text-[#1A1D1F] block cursor-pointer">
                  Permission to create & manage downloads folder
                </label>
                <p className="text-[#6F767E] text-[11px] mt-0.5 leading-relaxed">
                  Allows saving video/audio files directly to your local downloads directory ({systemInfo?.defaultDownloadDir || 'Downloads\\TubeFlow'}).
                </p>
              </div>
            </div>

            {/* Item 3: Auto Updates */}
            <div className="p-4 bg-[#F9FAFB] border border-[#ECEEF2] rounded-3xl flex items-start gap-3.5">
              <input
                type="checkbox"
                id="perm-updates"
                checked={perms.autoUpdatePermitted}
                onChange={(e) => setPerms({ ...perms, autoUpdatePermitted: e.target.checked })}
                className="mt-1 w-4 h-4 text-[#E94E58] rounded border-gray-300 focus:ring-[#E94E58]"
              />
              <div className="flex-1">
                <label htmlFor="perm-updates" className="font-bold text-[#1A1D1F] block cursor-pointer">
                  Permission for automatic yt-dlp engine updates
                </label>
                <p className="text-[#6F767E] text-[11px] mt-0.5 leading-relaxed">
                  YouTube frequently updates its formats and algorithms. Enabling this permits downloading latest yt-dlp extractor patches automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Engine Status & Update Button */}
          <div className="p-4 bg-[#FFF8F8] border border-[#FFE2E4] rounded-3xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#E94E58]" />
                <span className="font-bold text-[#1A1D1F]">Engine Health & Latest Releases</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF0] text-[#12B76A] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6F767E] text-[11px]">
              <span>yt-dlp: <b className="text-[#1A1D1F]">{systemInfo?.ytdlpVersion || '2026.10.26'}</b></span>
              <span>FFmpeg: <b className="text-[#1A1D1F]">{systemInfo?.ffmpegVersion || '9.0.2'}</b></span>
            </div>

            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#FEECEE] text-[#E94E58] border border-[#FFE2E4] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Updating Engines...' : 'Fetch & Install Latest yt-dlp'}</span>
            </button>

            {updateMsg && (
              <div className="p-2.5 bg-white rounded-xl border border-[#FFE2E4] text-[11px] font-mono text-[#6F767E] break-words">
                {updateMsg}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-[#F0F2F5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8C93A0] hover:text-[#1A1D1F] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-[#E94E58] hover:bg-[#D63C47] text-white text-xs font-bold shadow-coral-glow transition-all"
          >
            Confirm & Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
