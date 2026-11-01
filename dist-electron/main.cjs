var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var path = __toESM(require("path"), 1);
var fs = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var mainWindow = null;
var activeDownloads = /* @__PURE__ */ new Map();
function getBinaryPaths() {
  let ytdlpPath = "yt-dlp";
  let ffmpegPath = "ffmpeg";
  const localBinYt = path.join(import_electron.app.getAppPath(), "bin", "yt-dlp.exe");
  if (fs.existsSync(localBinYt)) ytdlpPath = localBinYt;
  const localBinFfmpeg = path.join(import_electron.app.getAppPath(), "bin", "ffmpeg.exe");
  if (fs.existsSync(localBinFfmpeg)) ffmpegPath = localBinFfmpeg;
  if (process.resourcesPath) {
    const resBinYt = path.join(process.resourcesPath, "bin", "yt-dlp.exe");
    if (fs.existsSync(resBinYt)) ytdlpPath = resBinYt;
    const resBinFfmpeg = path.join(process.resourcesPath, "bin", "ffmpeg.exe");
    if (fs.existsSync(resBinFfmpeg)) ffmpegPath = resBinFfmpeg;
  }
  if (ytdlpPath === "yt-dlp") {
    const pythonUserPath = path.join(
      process.env.USERPROFILE || "C:\\Users\\DarK",
      "AppData",
      "Roaming",
      "Python",
      "Python314",
      "Scripts",
      "yt-dlp.exe"
    );
    if (fs.existsSync(pythonUserPath)) ytdlpPath = pythonUserPath;
  }
  if (ffmpegPath === "ffmpeg") {
    const wingetFFmpeg = path.join(
      process.env.LOCALAPPDATA || "C:\\Users\\DarK\\AppData\\Local",
      "Microsoft",
      "WinGet",
      "Packages",
      "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
      "ffmpeg-9.0.2-full_build",
      "bin",
      "ffmpeg.exe"
    );
    if (fs.existsSync(wingetFFmpeg)) ffmpegPath = wingetFFmpeg;
  }
  return { ytdlpPath, ffmpegPath };
}
function getHistoryFilePath() {
  const userDataDir = import_electron.app.getPath("userData");
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, "tubeflow-downloads-history.json");
}
function loadHistory() {
  try {
    const file = getHistoryFilePath();
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load history:", err);
  }
  return [];
}
function saveHistory(items) {
  try {
    const file = getHistoryFilePath();
    fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save history:", err);
    return false;
  }
}
function getPermissionsFilePath() {
  return path.join(import_electron.app.getPath("userData"), "tubeflow-permissions.json");
}
function loadPermissions() {
  try {
    const file = getPermissionsFilePath();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch {
  }
  return {
    ytdlpPermitted: true,
    storagePermitted: true,
    autoUpdatePermitted: true
  };
}
function savePermissions(perms) {
  try {
    const file = getPermissionsFilePath();
    fs.writeFileSync(file, JSON.stringify(perms, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    title: "TubeFlow - Modern YouTube Downloader",
    backgroundColor: "#F5F6FA",
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
  const devUrl = process.env.VITE_DEV_SERVER_URL || (process.argv.includes("--dev") ? "http://localhost:5173" : "");
  const distHtmlPath = path.join(__dirname, "../dist/index.html");
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else if (fs.existsSync(distHtmlPath)) {
    mainWindow.loadFile(distHtmlPath);
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.app.whenReady().then(() => {
  console.log("TubeFlow main process ready, creating window...");
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron.app.quit();
});
import_electron.ipcMain.on("window-minimize", () => mainWindow?.minimize());
import_electron.ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
import_electron.ipcMain.on("window-close", () => mainWindow?.close());
import_electron.ipcMain.handle("get-system-info", async () => {
  const { ytdlpPath, ffmpegPath } = getBinaryPaths();
  const defaultDownloadDir = path.join(import_electron.app.getPath("downloads"), "TubeFlow");
  if (!fs.existsSync(defaultDownloadDir)) {
    try {
      fs.mkdirSync(defaultDownloadDir, { recursive: true });
    } catch {
    }
  }
  let ytdlpVersion = "Unknown";
  let isYtdlpReady = false;
  try {
    const res = await new Promise((resolve, reject) => {
      (0, import_child_process.execFile)(ytdlpPath, ["--version"], (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
    ytdlpVersion = res;
    isYtdlpReady = true;
  } catch (e) {
    console.error("yt-dlp check failed:", e);
  }
  let ffmpegVersion = "Unknown";
  let isFfmpegReady = false;
  try {
    const res = await new Promise((resolve, reject) => {
      (0, import_child_process.execFile)(ffmpegPath, ["-version"], (err, stdout) => {
        if (err) reject(err);
        else {
          const firstLine = stdout.split("\n")[0] || "";
          resolve(firstLine.replace("ffmpeg version ", "").split(" ")[0]);
        }
      });
    });
    ffmpegVersion = res;
    isFfmpegReady = true;
  } catch (e) {
    console.error("ffmpeg check failed:", e);
  }
  return {
    ytdlpPath,
    ytdlpVersion,
    ffmpegPath,
    ffmpegVersion,
    defaultDownloadDir,
    isYtdlpReady,
    isFfmpegReady
  };
});
import_electron.ipcMain.handle("get-permissions", async () => {
  return loadPermissions();
});
import_electron.ipcMain.handle("save-permissions", async (_, perms) => {
  return savePermissions(perms);
});
import_electron.ipcMain.handle("update-ytdlp", async () => {
  const { ytdlpPath } = getBinaryPaths();
  return new Promise((resolve) => {
    (0, import_child_process.execFile)(ytdlpPath, ["-U"], (err, stdout, stderr) => {
      if (err) {
        resolve({
          success: false,
          message: stderr || err.message || "Could not update yt-dlp automatically."
        });
      } else {
        resolve({
          success: true,
          message: stdout.trim() || "yt-dlp updated successfully to the latest release."
        });
      }
    });
  });
});
function launchUninstallerExe() {
  const appDir = path.dirname(import_electron.app.getPath("exe"));
  const candidates = [
    path.join(appDir, "TubeFlow-Uninstaller.exe"),
    path.join(process.cwd(), "TubeFlow-Uninstaller.exe"),
    path.join(appDir, "Uninstall TubeFlow.exe")
  ];
  for (const exe of candidates) {
    if (fs.existsSync(exe)) {
      (0, import_child_process.spawn)(exe, [], { detached: true, stdio: "ignore" });
      setTimeout(() => import_electron.app.quit(), 600);
      return true;
    }
  }
  return false;
}
import_electron.ipcMain.handle("perform-uninstall", async (_, level) => {
  try {
    const defaultDownloadDir = path.join(import_electron.app.getPath("downloads"), "TubeFlow");
    const userDataDir = import_electron.app.getPath("userData");
    if (level === "total") {
      if (fs.existsSync(defaultDownloadDir)) {
        try {
          fs.rmSync(defaultDownloadDir, { recursive: true, force: true });
        } catch (e) {
          console.warn("Error deleting downloads folder:", e);
        }
      }
      if (fs.existsSync(userDataDir)) {
        try {
          fs.rmSync(userDataDir, { recursive: true, force: true });
        } catch {
        }
      }
      launchUninstallerExe();
      return {
        success: true,
        message: "Total removal executed: All downloaded media, history, and app settings have been purged."
      };
    } else if (level === "clean") {
      saveHistory([]);
      if (fs.existsSync(userDataDir)) {
        try {
          const files = fs.readdirSync(userDataDir);
          for (const f of files) {
            fs.rmSync(path.join(userDataDir, f), { recursive: true, force: true });
          }
        } catch {
        }
      }
      launchUninstallerExe();
      return {
        success: true,
        message: "Clean uninstall executed: History, caches, and settings cleared. Downloaded media was preserved."
      };
    } else {
      launchUninstallerExe();
      return {
        success: true,
        message: "Standard removal launched. Follow the uninstaller wizard prompts."
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || "Uninstall action encountered an error."
    };
  }
});
import_electron.ipcMain.handle("select-directory", async () => {
  if (!mainWindow) return null;
  const result = await import_electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
    defaultPath: path.join(import_electron.app.getPath("downloads"), "TubeFlow")
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});
import_electron.ipcMain.handle("open-file", async (_, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const res = await import_electron.shell.openPath(filePath);
      return { success: res === "", error: res };
    }
    return { success: false, error: "File does not exist" };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
import_electron.ipcMain.handle("show-in-folder", async (_, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      import_electron.shell.showItemInFolder(filePath);
      return { success: true };
    }
    return { success: false, error: "File does not exist" };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
import_electron.ipcMain.handle("get-history", async () => {
  return loadHistory();
});
import_electron.ipcMain.handle("save-history", async (_, items) => {
  return saveHistory(items);
});
import_electron.ipcMain.handle("clear-history", async () => {
  return saveHistory([]);
});
import_electron.ipcMain.handle("get-video-info", async (_, url) => {
  const { ytdlpPath } = getBinaryPaths();
  return new Promise((resolve) => {
    const args = [
      "--dump-single-json",
      "--skip-download",
      "--no-playlist",
      "--no-warnings",
      "--js-runtimes",
      "node",
      url
    ];
    const child = (0, import_child_process.spawn)(ytdlpPath, args, { windowsHide: true });
    let stdoutBuffer = "";
    let stderrBuffer = "";
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString("utf-8");
    });
    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk.toString("utf-8");
    });
    child.on("close", (code) => {
      if (code !== 0 || !stdoutBuffer) {
        console.error("yt-dlp info error:", stderrBuffer);
        return resolve({
          success: false,
          error: stderrBuffer || "Failed to extract video information"
        });
      }
      try {
        let clean = stdoutBuffer.trim();
        if (clean.charCodeAt(0) === 65279) {
          clean = clean.slice(1);
        }
        const data = JSON.parse(clean);
        const durationSec = data.duration || 0;
        const rawFormats = data.formats || [];
        let defaultAudioBytes = 0;
        for (const fmt of rawFormats) {
          if (fmt.acodec && fmt.acodec !== "none" && (!fmt.vcodec || fmt.vcodec === "none")) {
            const aBytes = fmt.filesize || fmt.filesize_approx || (fmt.abr || 128) * 1e3 * durationSec / 8;
            if (aBytes > defaultAudioBytes) {
              defaultAudioBytes = aBytes;
            }
          }
        }
        if (!defaultAudioBytes && durationSec) {
          defaultAudioBytes = 160 * 1e3 * durationSec / 8;
        }
        const videoQualitiesMap = /* @__PURE__ */ new Map();
        const audioQualitiesMap = /* @__PURE__ */ new Map();
        const videoBitrateTable = {
          2160: 18e3,
          1440: 9500,
          1080: 3800,
          720: 1800,
          480: 900,
          360: 500,
          240: 250,
          144: 150
        };
        for (const fmt of rawFormats) {
          if (fmt.height && fmt.vcodec && fmt.vcodec !== "none") {
            const h = fmt.height;
            const existing = videoQualitiesMap.get(h);
            let vBytes = fmt.filesize || fmt.filesize_approx;
            if (!vBytes && (fmt.tbr || fmt.vbr) && durationSec) {
              const bitrate = fmt.vbr || (fmt.tbr ? fmt.tbr * 0.85 : 0);
              vBytes = Math.round(bitrate * 1e3 * durationSec / 8);
            }
            if (!vBytes && durationSec) {
              const estBr = videoBitrateTable[h] || (h >= 1080 ? 3800 : 1200);
              vBytes = Math.round(estBr * 1e3 * durationSec / 8);
            }
            const totalBytes = (vBytes || 0) + (fmt.acodec && fmt.acodec !== "none" ? 0 : defaultAudioBytes);
            const sizeFormatted = totalBytes > 0 ? formatBytes(totalBytes) : void 0;
            let label = `${h}p`;
            if (h >= 2160) label = "4K Ultra HD (2160p)";
            else if (h >= 1440) label = "2K Quad HD (1440p)";
            else if (h >= 1080) label = "1080p Full HD";
            else if (h >= 720) label = "720p HD";
            else if (h >= 480) label = "480p SD";
            else label = `${h}p Standard`;
            if (fmt.fps && fmt.fps > 30) {
              label += ` ${fmt.fps}fps`;
            }
            if (!existing || fmt.fps && (existing.fps || 30) < fmt.fps || !existing.estimatedSize && sizeFormatted) {
              videoQualitiesMap.set(h, {
                label,
                height: h,
                fps: fmt.fps || 30,
                format_id: fmt.format_id,
                ext: fmt.ext || "mp4",
                estimatedSize: sizeFormatted || existing?.estimatedSize
              });
            }
          }
          if (fmt.acodec && fmt.acodec !== "none" && (!fmt.vcodec || fmt.vcodec === "none")) {
            const abr = Math.round(fmt.abr || 128);
            if (abr > 40 && !audioQualitiesMap.has(abr)) {
              let label = `${abr} kbps`;
              if (abr >= 320) label = `${abr} kbps (Ultra High)`;
              else if (abr >= 256) label = `${abr} kbps (High Quality)`;
              else if (abr >= 160) label = `${abr} kbps (Standard)`;
              else label = `${abr} kbps (Compact)`;
              let aSize = fmt.filesize || fmt.filesize_approx;
              if (!aSize && durationSec) {
                aSize = Math.round(abr * 1e3 * durationSec / 8);
              }
              audioQualitiesMap.set(abr, {
                label,
                abr,
                format_id: fmt.format_id,
                ext: fmt.ext || "mp3",
                estimatedSize: aSize ? formatBytes(aSize) : void 0
              });
            }
          }
        }
        const videoQualities = Array.from(videoQualitiesMap.values()).sort((a, b) => b.height - a.height);
        const audioQualities = Array.from(audioQualitiesMap.values()).sort((a, b) => b.abr - a.abr);
        if (audioQualities.length === 0) {
          const defaultAudioBitrates = [320, 256, 192, 128];
          for (const abr of defaultAudioBitrates) {
            const estBytes = durationSec ? Math.round(abr * 1e3 * durationSec / 8) : 0;
            audioQualities.push({
              label: abr === 320 ? "320 kbps (High Fidelity)" : abr === 256 ? "256 kbps (High Quality)" : abr === 192 ? "192 kbps (Standard)" : "128 kbps (Compact)",
              abr,
              format_id: "bestaudio",
              ext: "mp3",
              estimatedSize: estBytes ? formatBytes(estBytes) : void 0
            });
          }
        }
        const info = {
          id: data.id,
          url,
          title: data.title || "Untitled Video",
          description: data.description || "",
          thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : ""),
          duration: data.duration || 0,
          durationFormatted: formatDuration(data.duration || 0),
          uploader: data.uploader || data.channel || "Unknown Channel",
          channelUrl: data.channel_url || data.uploader_url,
          viewCount: data.view_count || 0,
          uploadDate: data.upload_date,
          videoQualities,
          audioQualities
        };
        resolve({ success: true, data: info });
      } catch (err) {
        console.error("Parse JSON error:", err);
        resolve({ success: false, error: "Could not parse video data: " + err.message });
      }
    });
    child.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});
import_electron.ipcMain.handle("start-download", async (_, options) => {
  const { ytdlpPath, ffmpegPath } = getBinaryPaths();
  const downloadId = options.id;
  if (!fs.existsSync(options.outputFolder)) {
    try {
      fs.mkdirSync(options.outputFolder, { recursive: true });
    } catch (err) {
      return { success: false, id: downloadId, error: "Could not create output directory: " + err.message };
    }
  }
  const outputTemplate = path.join(options.outputFolder, "%(title)s [%(id)s].%(ext)s");
  const args = [
    "--newline",
    "--progress",
    "--progress-template",
    "%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._total_bytes_str)s|%(progress.status)s",
    "--ffmpeg-location",
    ffmpegPath,
    "--js-runtimes",
    "node",
    "-o",
    outputTemplate
  ];
  if (options.mode === "best") {
    args.push("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best");
    args.push("--merge-output-format", "mp4");
  } else if (options.mode === "video") {
    const h = options.videoQualityHeight || 1080;
    const container = options.videoContainer || "mp4";
    args.push("-f", `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`);
    args.push("--merge-output-format", container);
  } else if (options.mode === "audio") {
    const container = options.audioContainer || "mp3";
    const abr = options.audioBitrate || 320;
    args.push("-x");
    args.push("--audio-format", container);
    args.push("--audio-quality", `${abr}K`);
  }
  if (options.embedThumbnail) {
    args.push("--embed-thumbnail");
  }
  if (options.embedSubtitles) {
    args.push("--write-subs", "--embed-subs");
  }
  args.push(options.url);
  try {
    const child = (0, import_child_process.spawn)(ytdlpPath, args, { windowsHide: true });
    activeDownloads.set(downloadId, child);
    let detectedFilePath = "";
    let totalBytes = 0;
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf-8");
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        if (!line.trim()) continue;
        if (line.includes("|")) {
          const parts = line.split("|");
          if (parts.length >= 4) {
            const percentStr = parts[0].replace("%", "").trim();
            const speed = parts[1].trim() || "Calculating...";
            const eta = parts[2].trim() || "--:--";
            const totalBytesStr = parts[3].trim();
            const status = parts[4]?.trim() || "downloading";
            const progress = parseFloat(percentStr) || 0;
            const parsedTotal = parseFloat(totalBytesStr) || 0;
            if (parsedTotal > 0) totalBytes = parsedTotal;
            mainWindow?.webContents.send("download-progress", {
              id: downloadId,
              progress: Math.min(progress, 99.5),
              speed,
              eta,
              status: status === "finished" ? "processing" : "downloading",
              totalBytes
            });
            continue;
          }
        }
        const destMatch = line.match(/\[download\] Destination: (.+)/i);
        if (destMatch && destMatch[1]) {
          detectedFilePath = destMatch[1].trim();
        }
        const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/i);
        if (mergeMatch && mergeMatch[1]) {
          detectedFilePath = mergeMatch[1].trim();
          mainWindow?.webContents.send("download-progress", {
            id: downloadId,
            progress: 99,
            speed: "Processing",
            eta: "00:01",
            status: "processing"
          });
        }
        const audioDestMatch = line.match(/\[ExtractAudio\] Destination: (.+)/i);
        if (audioDestMatch && audioDestMatch[1]) {
          detectedFilePath = audioDestMatch[1].trim();
        }
        const regexMatch = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+~?([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+(\S+)/i);
        if (regexMatch) {
          const progress = parseFloat(regexMatch[1]);
          const speed = regexMatch[3];
          const eta = regexMatch[4];
          mainWindow?.webContents.send("download-progress", {
            id: downloadId,
            progress: Math.min(progress, 99.5),
            speed,
            eta,
            status: "downloading"
          });
        }
      }
    });
    child.stderr.on("data", (chunk) => {
      console.warn(`yt-dlp [${downloadId}] stderr:`, chunk.toString("utf-8"));
    });
    child.on("close", (code) => {
      activeDownloads.delete(downloadId);
      if (code === 0) {
        if (!detectedFilePath) {
          try {
            const files = fs.readdirSync(options.outputFolder);
            const matching = files.filter((f) => f.includes(`[${options.id}]`) || f.includes(options.title.substring(0, 15))).map((f) => ({ name: f, time: fs.statSync(path.join(options.outputFolder, f)).mtimeMs })).sort((a, b) => b.time - a.time);
            if (matching.length > 0) {
              detectedFilePath = path.join(options.outputFolder, matching[0].name);
            }
          } catch {
          }
        }
        let finalSize = 0;
        if (detectedFilePath && fs.existsSync(detectedFilePath)) {
          try {
            finalSize = fs.statSync(detectedFilePath).size;
          } catch {
          }
        }
        mainWindow?.webContents.send("download-complete", {
          id: downloadId,
          filePath: detectedFilePath,
          totalBytes: finalSize || totalBytes
        });
      } else {
        mainWindow?.webContents.send("download-error", {
          id: downloadId,
          error: `Process finished with error code ${code}`
        });
      }
    });
    child.on("error", (err) => {
      activeDownloads.delete(downloadId);
      mainWindow?.webContents.send("download-error", {
        id: downloadId,
        error: err.message
      });
    });
    return { success: true, id: downloadId };
  } catch (err) {
    return { success: false, id: downloadId, error: err.message };
  }
});
import_electron.ipcMain.handle("cancel-download", async (_, id) => {
  const child = activeDownloads.get(id);
  if (child && child.pid) {
    try {
      if (process.platform === "win32") {
        (0, import_child_process.spawn)("taskkill", ["/pid", child.pid.toString(), "/T", "/F"], { windowsHide: true });
      } else {
        child.kill("SIGTERM");
      }
      activeDownloads.delete(id);
      return { success: true };
    } catch (e) {
      console.error("Cancel failed:", e);
    }
  }
  return { success: false };
});
