import { contextBridge, ipcRenderer } from 'electron';
import type { DownloadOptions, DownloadItem, SystemInfo, UninstallLevel, AppPermissions } from '../src/types';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  startDownload: (options: DownloadOptions) => ipcRenderer.invoke('start-download', options),
  cancelDownload: (id: string) => ipcRenderer.invoke('cancel-download', id),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke('show-in-folder', filePath),
  getSystemInfo: (): Promise<SystemInfo> => ipcRenderer.invoke('get-system-info'),
  getDownloadHistory: (): Promise<DownloadItem[]> => ipcRenderer.invoke('get-history'),
  saveDownloadHistory: (items: DownloadItem[]) => ipcRenderer.invoke('save-history', items),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Engine updater & Uninstaller
  updateYtdlp: () => ipcRenderer.invoke('update-ytdlp'),
  installCoreEngines: () => ipcRenderer.invoke('install-core-engines'),
  onEngineInstallLog: (callback: (log: string) => void) => {
    const handler = (_: any, log: string) => callback(log);
    ipcRenderer.on('engine-install-log', handler);
    return () => ipcRenderer.removeListener('engine-install-log', handler);
  },
  performUninstall: (level: UninstallLevel) => ipcRenderer.invoke('perform-uninstall', level),
  getAppPermissions: () => ipcRenderer.invoke('get-permissions'),
  saveAppPermissions: (perms: AppPermissions) => ipcRenderer.invoke('save-permissions', perms),

  // Event listeners
  onProgressUpdate: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  onDownloadComplete: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('download-complete', handler);
    return () => ipcRenderer.removeListener('download-complete', handler);
  },
  onDownloadError: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('download-error', handler);
    return () => ipcRenderer.removeListener('download-error', handler);
  },

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});
