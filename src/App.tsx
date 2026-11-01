import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { DownloadsView } from './views/DownloadsView';
import { MoreView } from './views/MoreView';
import { SettingsModal } from './components/SettingsModal';
import { EngineSetupModal } from './components/EngineSetupModal';
import { UninstallerModal } from './components/UninstallerModal';
import { AppIntro } from './components/AppIntro';
import type { VideoInfo, DownloadOptions, DownloadItem, SystemInfo, AppPermissions, UninstallLevel } from './types';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<'home' | 'downloads' | 'more'>('home');
  const [urlInput, setUrlInput] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [outputFolder, setOutputFolder] = useState<string>('D:\\Downloads\\TubeFlow');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [downloadsHistory, setDownloadsHistory] = useState<DownloadItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEngineSetupOpen, setIsEngineSetupOpen] = useState<boolean>(false);
  const [isUninstallerOpen, setIsUninstallerOpen] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<AppPermissions>({
    allowNetwork: true,
    allowYtdlpExecution: true,
    allowFfmpegExecution: true,
    allowStorageWrite: true,
    allowDesktopShortcuts: true,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Check if running inside Electron
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const handleRefreshSystemInfo = async (): Promise<SystemInfo | null> => {
    if (isElectron) {
      try {
        const info = await window.electronAPI.getSystemInfo();
        setSystemInfo(info);
        return info;
      } catch (e) {
        console.error('Failed to refresh system info:', e);
      }
    }
    return null;
  };

  // Initialize System Info & History
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.getSystemInfo().then((info) => {
        setSystemInfo(info);
        if (info.defaultDownloadDir) {
          setOutputFolder(info.defaultDownloadDir);
        }
      }).catch(console.error);

      window.electronAPI.getDownloadHistory().then((history) => {
        if (Array.isArray(history)) {
          setDownloadsHistory(history);
        }
      }).catch(console.error);

      if (window.electronAPI.getAppPermissions) {
        window.electronAPI.getAppPermissions().then((perms) => {
          if (perms) {
            setPermissions(perms);
          }
        }).catch(console.error);
      }

      // Listen for download progress
      const unsubProgress = window.electronAPI.onProgressUpdate((data) => {
        setDownloadsHistory((prev) =>
          prev.map((item) => {
            if (item.id === data.id) {
              return {
                ...item,
                progress: data.progress,
                speed: data.speed,
                eta: data.eta,
                status: data.status,
                totalBytes: data.totalBytes || item.totalBytes,
              };
            }
            return item;
          })
        );
      });

      // Listen for download complete
      const unsubComplete = window.electronAPI.onDownloadComplete((data) => {
        setDownloadsHistory((prev) => {
          const updated = prev.map((item) => {
            if (item.id === data.id) {
              return {
                ...item,
                progress: 100,
                status: 'completed' as const,
                filePath: data.filePath,
                totalBytes: data.totalBytes || item.totalBytes,
                completedAt: new Date().toISOString(),
              };
            }
            return item;
          });
          window.electronAPI.saveDownloadHistory(updated);
          return updated;
        });

        showToast('Download completed successfully!', 'success');
      });

      // Listen for download error
      const unsubError = window.electronAPI.onDownloadError((data) => {
        setDownloadsHistory((prev) => {
          const updated = prev.map((item) => {
            if (item.id === data.id) {
              return {
                ...item,
                status: 'error' as const,
                errorMessage: data.error,
              };
            }
            return item;
          });
          window.electronAPI.saveDownloadHistory(updated);
          return updated;
        });

        showToast(data.error || 'Download encountered an error', 'error');
      });

      return () => {
        unsubProgress();
        unsubComplete();
        unsubError();
      };
    } else {
      // Mock history for preview in standard browser
      setDownloadsHistory([
        {
          id: 'dl_rick_sample',
          videoId: 'dQw4w9WgXcQ',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          channel: 'Rick Astley',
          status: 'completed',
          progress: 100,
          speed: '14.2 MB/s',
          eta: '00:00',
          downloadedBytes: 243768398,
          totalBytes: 243768398,
          fileSizeFormatted: '232.4 MB',
          filePath: 'D:\\Downloads\\TubeFlow\\Never Gonna Give You Up.mp4',
          formatBadge: '4K MP4',
          mode: 'best',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }
      ]);
    }
  }, [isElectron]);

  // Reset / Back to search handler
  const handleResetSearch = () => {
    setVideoInfo(null);
    setUrlInput('');
  };

  // Analyze URL handler
  const handleAnalyze = async (overrideUrl?: string) => {
    if (overrideUrl === '') {
      handleResetSearch();
      return;
    }
    const targetUrl = (overrideUrl || urlInput).trim();
    if (!targetUrl) return;

    setUrlInput(targetUrl);
    setIsLoading(true);

    if (isElectron) {
      try {
        const result = await window.electronAPI.getVideoInfo(targetUrl);
        if (result.success && result.data) {
          setVideoInfo(result.data);
          setCurrentTab('home');
          showToast(`Found "${result.data.title.substring(0, 35)}..."`);
        } else {
          if (result.error && (result.error.includes('ENOENT') || result.error.includes('spawn'))) {
            setIsEngineSetupOpen(true);
            showToast('Core engine missing. Launching automatic setup...', 'error');
          } else {
            showToast(result.error || 'Failed to analyze video. Check URL and try again.', 'error');
          }
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('ENOENT') || err.message.includes('spawn'))) {
          setIsEngineSetupOpen(true);
          showToast('Core engine missing. Launching automatic setup...', 'error');
        } else {
          showToast(err.message || 'Error occurred while contacting engine.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulated response in browser mode
      setTimeout(() => {
        setVideoInfo({
          id: 'dQw4w9WgXcQ',
          url: targetUrl,
          title: 'Rick Astley - Never Gonna Give You Up (Official Music Video) [4K Remaster]',
          description: 'The official video for Never Gonna Give You Up by Rick Astley',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 213,
          durationFormatted: '3:33',
          uploader: 'Rick Astley',
          viewCount: 1832000000,
          videoQualities: [
            { label: '4K Ultra HD (2160p) 60fps', height: 2160, fps: 60, format_id: '401', ext: 'mp4', estimatedSize: '243 MB' },
            { label: '1440p Quad HD 60fps', height: 1440, fps: 60, format_id: '400', ext: 'mp4', estimatedSize: '162 MB' },
            { label: '1080p Full HD 60fps', height: 1080, fps: 60, format_id: '299', ext: 'mp4', estimatedSize: '88 MB' },
            { label: '720p HD 60fps', height: 720, fps: 60, format_id: '298', ext: 'mp4', estimatedSize: '45 MB' },
            { label: '480p SD', height: 480, fps: 30, format_id: '135', ext: 'mp4', estimatedSize: '24 MB' },
          ],
          audioQualities: [
            { label: '320 kbps (High Fidelity)', abr: 320, format_id: 'bestaudio', ext: 'mp3', estimatedSize: '8.4 MB' },
            { label: '256 kbps (High Quality)', abr: 256, format_id: 'bestaudio', ext: 'mp3', estimatedSize: '6.7 MB' },
            { label: '192 kbps (Standard)', abr: 192, format_id: 'bestaudio', ext: 'mp3', estimatedSize: '5.1 MB' },
            { label: '128 kbps (Compact)', abr: 128, format_id: 'bestaudio', ext: 'mp3', estimatedSize: '3.4 MB' },
          ],
        });
        setIsLoading(false);
        showToast('Video analyzed successfully!');
      }, 700);
    }
  };

  // Start Download handler
  const handleStartDownload = async (options: DownloadOptions) => {
    let formatBadge = '1080p MP4';
    if (options.mode === 'best') formatBadge = 'Best MP4';
    else if (options.mode === 'video') formatBadge = `${options.videoQualityHeight || 1080}p ${(options.videoContainer || 'mp4').toUpperCase()}`;
    else if (options.mode === 'audio') formatBadge = `${options.audioBitrate || 320}k ${(options.audioContainer || 'mp3').toUpperCase()}`;

    const newItem: DownloadItem = {
      id: options.id,
      videoId: videoInfo?.id || 'yt_media',
      url: options.url,
      title: options.title,
      thumbnail: options.thumbnail,
      channel: options.channel,
      status: 'downloading',
      progress: 0,
      speed: 'Initializing...',
      eta: '--:--',
      downloadedBytes: 0,
      totalBytes: 0,
      fileSizeFormatted: '',
      filePath: '',
      formatBadge,
      mode: options.mode,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...downloadsHistory];
    setDownloadsHistory(updated);

    if (isElectron) {
      window.electronAPI.saveDownloadHistory(updated);
      try {
        const res = await window.electronAPI.startDownload(options);
        if (!res.success) {
          showToast(res.error || 'Failed to start download process', 'error');
        } else {
          showToast('Download started in background!');
        }
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    } else {
      // Simulated progress in browser
      let prog = 5;
      const interval = setInterval(() => {
        prog += 15;
        if (prog >= 100) {
          clearInterval(interval);
          setDownloadsHistory((prev) =>
            prev.map((d) =>
              d.id === newItem.id
                ? { ...d, progress: 100, status: 'completed', speed: 'Done', eta: '00:00', completedAt: new Date().toISOString() }
                : d
            )
          );
          showToast('Download finished!');
        } else {
          setDownloadsHistory((prev) =>
            prev.map((d) =>
              d.id === newItem.id
                ? { ...d, progress: prog, speed: '9.4 MB/s', eta: '00:10' }
                : d
            )
          );
        }
      }, 600);
    }

    // Switch to downloads tab to view live progress
    setCurrentTab('downloads');
  };

  // Cancel Download handler
  const handleCancelDownload = async (id: string) => {
    if (isElectron) {
      await window.electronAPI.cancelDownload(id);
    }
    setDownloadsHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' as const, speed: 'Cancelled' } : item
      );
      if (isElectron) window.electronAPI.saveDownloadHistory(updated);
      return updated;
    });
    showToast('Download cancelled');
  };

  // Open file handler
  const handleOpenFile = async (filePath: string) => {
    if (isElectron && filePath) {
      const res = await window.electronAPI.openFile(filePath);
      if (!res.success) {
        showToast(res.error || 'Could not open media file', 'error');
      }
    }
  };

  // Show in folder handler
  const handleShowInFolder = async (filePath: string) => {
    if (isElectron && filePath) {
      await window.electronAPI.showInFolder(filePath);
    }
  };

  // Select output folder
  const handleSelectOutputFolder = async () => {
    if (isElectron) {
      const selected = await window.electronAPI.selectDirectory();
      if (selected) {
        setOutputFolder(selected);
        showToast(`Output folder updated to: ${selected}`);
      }
    }
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = downloadsHistory.filter((item) => item.id !== id);
    setDownloadsHistory(updated);
    if (isElectron) {
      window.electronAPI.saveDownloadHistory(updated);
    }
  };

  // Clear completed items
  const handleClearCompleted = () => {
    const updated = downloadsHistory.filter(
      (item) => item.status === 'downloading' || item.status === 'processing'
    );
    setDownloadsHistory(updated);
    if (isElectron) {
      window.electronAPI.saveDownloadHistory(updated);
    }
    showToast('Completed downloads cleared from history');
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    setDownloadsHistory([]);
    if (isElectron) {
      await window.electronAPI.clearHistory();
    }
    showToast('All download history cleared');
  };

  // Permissions & updates handler
  const handleSavePermissions = (newPerms: AppPermissions) => {
    setPermissions(newPerms);
    if (isElectron && window.electronAPI.saveAppPermissions) {
      window.electronAPI.saveAppPermissions(newPerms);
    }
    showToast('Component permissions updated successfully!');
  };

  const handleUpdateYtdlp = async (): Promise<{ success: boolean; message: string }> => {
    if (isElectron && window.electronAPI.updateYtdlp) {
      return await window.electronAPI.updateYtdlp();
    }
    return { success: true, message: 'yt-dlp engine is currently up-to-date.' };
  };

  // Uninstaller handler
  const handlePerformUninstall = async (level: UninstallLevel): Promise<{ success: boolean; message: string }> => {
    if (isElectron && window.electronAPI.performUninstall) {
      return await window.electronAPI.performUninstall(level);
    }
    return { success: true, message: `Completed ${level} uninstall simulation.` };
  };

  const activeDownloadsCount = downloadsHistory.filter(
    (d) => d.status === 'downloading' || d.status === 'processing'
  ).length;

  return (
    <div className="flex h-screen w-screen bg-grid-pattern text-[#2a0f14] font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all animate-in slide-in-from-top-3 border ${
            toast.type === 'success'
              ? 'bg-[#2a0f14] text-white border-[#fae261]/30'
              : 'bg-[#2a0f14] text-white border-[#ff4eaf]/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#fae261]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#ff4eaf]" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeDownloadsCount={activeDownloadsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          urlInput={urlInput}
          onUrlChange={setUrlInput}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic Views */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {currentTab === 'home' && (
            <HomeView
              videoInfo={videoInfo}
              isLoading={isLoading}
              onAnalyze={handleAnalyze}
              onResetSearch={handleResetSearch}
              onStartDownload={handleStartDownload}
              systemInfo={systemInfo}
              downloadsHistory={downloadsHistory}
              outputFolder={outputFolder}
              onSelectOutputFolder={handleSelectOutputFolder}
              onNavigateToDownloads={() => setCurrentTab('downloads')}
            />
          )}

          {currentTab === 'downloads' && (
            <DownloadsView
              downloads={downloadsHistory}
              onCancelDownload={handleCancelDownload}
              onOpenFile={handleOpenFile}
              onShowInFolder={handleShowInFolder}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearCompleted={handleClearCompleted}
              onOpenFolder={handleSelectOutputFolder}
              onNewDownload={() => setCurrentTab('home')}
              outputFolder={outputFolder}
            />
          )}

          {currentTab === 'more' && <MoreView />}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemInfo={systemInfo}
        outputFolder={outputFolder}
        onSelectOutputFolder={handleSelectOutputFolder}
        onClearHistory={handleClearAllHistory}
        onOpenEngineSetup={() => setIsEngineSetupOpen(true)}
        onOpenUninstaller={() => setIsUninstallerOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Core Media Engines Setup & Auto-Downloader Modal (Only opens if user clicks 'Setup Engines' in Settings or engine error) */}
      <EngineSetupModal
        isOpen={isEngineSetupOpen}
        onClose={() => setIsEngineSetupOpen(false)}
        systemInfo={systemInfo}
        onRefreshSystemInfo={handleRefreshSystemInfo}
      />

      {/* 3-Tier Uninstaller Wizard Modal */}
      <UninstallerModal
        isOpen={isUninstallerOpen}
        onClose={() => setIsUninstallerOpen(false)}
        onPerformUninstall={handlePerformUninstall}
        downloadDir={outputFolder}
      />

      {/* Liquid Glass Logo Startup Intro */}
      {showIntro && (
        <AppIntro onComplete={() => setShowIntro(false)} />
      )}
    </div>
  );
};

export default App;
