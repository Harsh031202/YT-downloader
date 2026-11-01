export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution?: string;
  height?: number | null;
  width?: number | null;
  fps?: number | null;
  vcodec?: string | null;
  acodec?: string | null;
  filesize?: number | null;
  filesize_approx?: number | null;
  tbr?: number | null;
  abr?: number | null;
  vbr?: number | null;
  format_note?: string | null;
}

export interface VideoQualityOption {
  label: string; // e.g., "1080p Full HD"
  height: number;
  fps: number;
  format_id: string;
  ext: string;
  estimatedSize?: string;
}

export interface AudioQualityOption {
  label: string; // e.g., "320 kbps (High Fidelity)"
  abr: number;
  format_id: string;
  ext: string;
  estimatedSize?: string;
}

export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // in seconds
  durationFormatted: string;
  uploader: string;
  channelUrl?: string;
  viewCount: number;
  uploadDate?: string;
  videoQualities: VideoQualityOption[];
  audioQualities: AudioQualityOption[];
}

export type DownloadMode = 'best' | 'video' | 'audio';
export type VideoContainer = 'mp4' | 'mkv' | 'webm';
export type AudioContainer = 'mp3' | 'm4a' | 'aac' | 'flac' | 'wav' | 'opus';

export interface DownloadOptions {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  mode: DownloadMode;
  videoQualityHeight?: number; // e.g. 1080, 2160
  videoContainer?: VideoContainer;
  audioBitrate?: number; // e.g. 320, 256
  audioContainer?: AudioContainer;
  outputFolder: string;
  embedSubtitles?: boolean;
  embedThumbnail?: boolean;
}

export type DownloadStatus = 
  | 'queued' 
  | 'downloading' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'cancelled';

export interface DownloadItem {
  id: string;
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  channel: string;
  status: DownloadStatus;
  progress: number; // 0 - 100
  speed: string; // e.g. "8.4 MB/s"
  eta: string; // e.g. "00:15"
  downloadedBytes: number;
  totalBytes: number;
  fileSizeFormatted: string;
  filePath: string;
  formatBadge: string; // e.g. "1080p MP4"
  mode: DownloadMode;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface SystemInfo {
  ytdlpPath: string;
  ytdlpVersion: string;
  ffmpegPath: string;
  ffmpegVersion: string;
  defaultDownloadDir: string;
  isYtdlpReady: boolean;
  isFfmpegReady: boolean;
}

export type UninstallLevel = 'standard' | 'clean' | 'total';

export interface AppPermissions {
  ytdlpPermitted: boolean;
  storagePermitted: boolean;
  autoUpdatePermitted: boolean;
}

// Window Electron API bridge
declare global {
  interface Window {
    electronAPI: {
      getVideoInfo: (url: string) => Promise<{ success: boolean; data?: VideoInfo; error?: string }>;
      startDownload: (options: DownloadOptions) => Promise<{ success: boolean; id: string; error?: string }>;
      cancelDownload: (id: string) => Promise<{ success: boolean }>;
      selectDirectory: () => Promise<string | null>;
      openFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      showInFolder: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      getSystemInfo: () => Promise<SystemInfo>;
      getDownloadHistory: () => Promise<DownloadItem[]>;
      saveDownloadHistory: (items: DownloadItem[]) => Promise<boolean>;
      clearHistory: () => Promise<boolean>;
      updateYtdlp: () => Promise<{ success: boolean; message: string }>;
      installCoreEngines: () => Promise<{ success: boolean; ytdlpOk: boolean; ffmpegOk: boolean; log: string }>;
      onEngineInstallLog: (callback: (log: string) => void) => () => void;
      performUninstall: (level: UninstallLevel) => Promise<{ success: boolean; message: string }>;
      getAppPermissions: () => Promise<AppPermissions>;
      saveAppPermissions: (perms: AppPermissions) => Promise<boolean>;
      onProgressUpdate: (callback: (data: { id: string; progress: number; speed: string; eta: string; status: DownloadStatus; downloadedBytes?: number; totalBytes?: number; filePath?: string }) => void) => () => void;
      onDownloadComplete: (callback: (data: { id: string; filePath: string; totalBytes: number }) => void) => () => void;
      onDownloadError: (callback: (data: { id: string; error: string }) => void) => () => void;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
