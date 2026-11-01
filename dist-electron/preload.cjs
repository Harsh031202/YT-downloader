// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  getVideoInfo: (url) => import_electron.ipcRenderer.invoke("get-video-info", url),
  startDownload: (options) => import_electron.ipcRenderer.invoke("start-download", options),
  cancelDownload: (id) => import_electron.ipcRenderer.invoke("cancel-download", id),
  selectDirectory: () => import_electron.ipcRenderer.invoke("select-directory"),
  openFile: (filePath) => import_electron.ipcRenderer.invoke("open-file", filePath),
  showInFolder: (filePath) => import_electron.ipcRenderer.invoke("show-in-folder", filePath),
  getSystemInfo: () => import_electron.ipcRenderer.invoke("get-system-info"),
  getDownloadHistory: () => import_electron.ipcRenderer.invoke("get-history"),
  saveDownloadHistory: (items) => import_electron.ipcRenderer.invoke("save-history", items),
  clearHistory: () => import_electron.ipcRenderer.invoke("clear-history"),
  // Engine updater & Uninstaller
  updateYtdlp: () => import_electron.ipcRenderer.invoke("update-ytdlp"),
  performUninstall: (level) => import_electron.ipcRenderer.invoke("perform-uninstall", level),
  getAppPermissions: () => import_electron.ipcRenderer.invoke("get-permissions"),
  saveAppPermissions: (perms) => import_electron.ipcRenderer.invoke("save-permissions", perms),
  // Event listeners
  onProgressUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    import_electron.ipcRenderer.on("download-progress", handler);
    return () => import_electron.ipcRenderer.removeListener("download-progress", handler);
  },
  onDownloadComplete: (callback) => {
    const handler = (_, data) => callback(data);
    import_electron.ipcRenderer.on("download-complete", handler);
    return () => import_electron.ipcRenderer.removeListener("download-complete", handler);
  },
  onDownloadError: (callback) => {
    const handler = (_, data) => callback(data);
    import_electron.ipcRenderer.on("download-error", handler);
    return () => import_electron.ipcRenderer.removeListener("download-error", handler);
  },
  // Window controls
  minimize: () => import_electron.ipcRenderer.send("window-minimize"),
  maximize: () => import_electron.ipcRenderer.send("window-maximize"),
  close: () => import_electron.ipcRenderer.send("window-close")
});
