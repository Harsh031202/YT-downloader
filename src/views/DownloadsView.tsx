import React, { useState } from 'react';
import { 
  Play, 
  FolderOpen, 
  Trash2, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Film, 
  Music, 
  Plus, 
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { DownloadItem } from '../types';

interface DownloadsViewProps {
  downloads: DownloadItem[];
  onCancelDownload: (id: string) => void;
  onOpenFile: (filePath: string) => void;
  onShowInFolder: (filePath: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearCompleted: () => void;
  onOpenFolder: () => void;
  onNewDownload: () => void;
  outputFolder: string;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  onCancelDownload,
  onOpenFile,
  onShowInFolder,
  onDeleteHistoryItem,
  onClearCompleted,
  onOpenFolder,
  onNewDownload,
  outputFolder,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'error'>('all');

  const filteredDownloads = downloads.filter((item) => {
    if (filter === 'active') return item.status === 'downloading' || item.status === 'processing' || item.status === 'queued';
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'error') return item.status === 'error' || item.status === 'cancelled';
    return true;
  });

  const activeCount = downloads.filter((d) => d.status === 'downloading' || d.status === 'processing').length;
  const completedCount = downloads.filter((d) => d.status === 'completed').length;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 lg:px-14 pb-16 pt-4 select-none">
      <div className="max-w-5xl mx-auto py-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#dfe0de]">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#2a0f14]">
              Downloads
            </h1>
            <p className="font-sans text-sm text-[#544145] mt-1 font-normal">
              Active streams, completed media files, and local export history.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenFolder}
              className="px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-[#2a0f14] border border-[#dfe0de] text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
              title={outputFolder}
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#544145]" />
              <span>Open Folder</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="px-3.5 py-2.5 rounded-full bg-white/80 hover:bg-white text-[#766e70] hover:text-[#2a0f14] border border-[#dfe0de] text-xs font-semibold shadow-xs transition-all"
              >
                Clear Done
              </button>
            )}

            <button
              onClick={onNewDownload}
              className="px-5 py-2.5 rounded-full bg-[#fae261] hover:bg-[#f9e47d] text-[#2a0f14] font-display font-medium text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>+ New Download</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'active', 'completed', 'error'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? downloads.length
                : tab === 'active'
                ? activeCount
                : tab === 'completed'
                ? completedCount
                : downloads.filter((d) => d.status === 'error' || d.status === 'cancelled').length;

            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2a0f14] text-white shadow-xs'
                    : 'bg-white/70 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#dfe0de] text-[#544145]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of Downloads - Cardless Clean Table/Row Layout */}
        {filteredDownloads.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#dfe0de]/80">
            {filteredDownloads.map((item) => {
              const isDownloading = item.status === 'downloading' || item.status === 'processing';
              const isCompleted = item.status === 'completed';
              const isError = item.status === 'error' || item.status === 'cancelled';

              return (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-white/40 -mx-3 px-3 rounded-2xl"
                >
                  {/* Thumbnail & Title Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-11 rounded-xl overflow-hidden bg-[#2a0f14] flex-shrink-0 relative border border-[#dfe0de]">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#fae261]">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 bg-black/80 text-white rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm font-medium text-[#2a0f14] truncate" title={item.title}>
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#766e70] mt-0.5">
                        <span className="text-[#544145] font-semibold">{item.channel || 'YouTube'}</span>
                        <span>•</span>
                        <span>{item.formatBadge}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.totalBytes && (
                          <>
                            <span>•</span>
                            <span>{formatBytes(item.totalBytes)}</span>
                          </>
                        )}
                      </div>

                      {/* Download Progress Bar if active */}
                      {isDownloading && (
                        <div className="mt-2.5 max-w-md">
                          <div className="flex items-center justify-between text-[11px] font-medium text-[#544145] mb-1">
                            <span>{item.statusMessage || 'Downloading...'}</span>
                            <span className="font-bold text-[#2a0f14]">{item.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#dfe0de] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#fae261] transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#766e70] mt-1">
                            <span>{item.speed || 'Streaming...'}</span>
                            <span>ETA: {item.eta || 'Calculated'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    {/* Status Badge */}
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d7f8e6] text-[#03af54] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Done</span>
                      </span>
                    )}

                    {isDownloading && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fae261] text-[#2a0f14] flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>In Progress</span>
                      </span>
                    )}

                    {isError && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffd1ea] text-[#ff4eaf] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                      </span>
                    )}

                    {/* Action buttons */}
                    {isCompleted && item.filePath && (
                      <>
                        <button
                          onClick={() => onOpenFile(item.filePath!)}
                          className="p-2 rounded-full bg-[#fae261] text-[#2a0f14] hover:bg-[#f9e47d] transition-all"
                          title="Play Media"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => onShowInFolder(item.filePath!)}
                          className="p-2 rounded-full bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] transition-all"
                          title="Show in Folder"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isDownloading && (
                      <button
                        onClick={() => onCancelDownload(item.id)}
                        className="px-3 py-1 rounded-full bg-white border border-[#dfe0de] text-xs text-[#544145] hover:text-[#2a0f14]"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-2 text-[#766e70] hover:text-[#2a0f14] transition-colors"
                      title="Remove from List"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="py-20 text-center flex flex-col items-center">
            <h3 className="font-display text-2xl font-medium text-[#2a0f14] mb-2">
              No downloads yet
            </h3>
            <p className="font-sans text-sm text-[#766e70] max-w-sm mb-6">
              Paste any YouTube video or audio link on the Home page to start high-speed extraction.
            </p>
            <button
              onClick={onNewDownload}
              className="px-6 py-3 rounded-full bg-[#fae261] hover:bg-[#f9e47d] text-[#2a0f14] font-display font-medium text-sm shadow-xs transition-all"
            >
              Start First Download ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
