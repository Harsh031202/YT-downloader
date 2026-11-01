# TubeFlow — Modern YouTube Downloader Desktop App

> A sleek, high-performance desktop application for downloading YouTube videos and audio in up to 4K / 60 FPS, built with **Electron**, **React**, **TypeScript**, **yt-dlp**, and **FFmpeg**.

Designed after modern clean dashboard aesthetics with a warm light palette (`#F5F6FA`), pure white curved cards, coral-red accent indicators (`#E94E58`), and real-time download streaming.

---

## 🖥️ Standalone Desktop App Executables

You do **not** need a terminal or command prompt to run TubeFlow. It is fully compiled and packaged as a native Windows desktop app:

| Launcher / File | Location | Description |
|---|---|---|
| **Windows Setup Installer** | [`release/TubeFlow Setup 1.0.0.exe`](file:///D:/Code/YT%20Downloader/release/TubeFlow%20Setup%201.0.0.exe) | **Official Setup Wizard** (`.exe`) with admin UAC elevation & engine permissions prompts. |
| **Standalone Uninstaller GUI** | [`Uninstall TubeFlow.exe`](file:///D:/Code/YT%20Downloader/Uninstall%20TubeFlow.exe) | **Single Improved GUI Uninstaller** (`.exe`) with administrator elevation and 3 removal tiers. |
| **Desktop Shortcut** | `Desktop\TubeFlow.lnk` | Double-click directly from your Windows Desktop. |
| **Project Shortcut** | [`TubeFlow.lnk`](file:///D:/Code/YT%20Downloader/TubeFlow.lnk) | Double-click from inside the project directory. |
| **1-Click App Launcher** | [`Launch-TubeFlow.bat`](file:///D:/Code/YT%20Downloader/Launch-TubeFlow.bat) | Direct launcher that starts the app and closes the console. |
| **Clean Unpacked Directory** | [`release/win-unpacked/`](file:///D:/Code/YT%20Downloader/release/win-unpacked) | Clean directory layout (`app/`, `TubeFlow.exe`, and `Uninstall TubeFlow.exe`). |

---

## 📁 Clean Application Layout

Instead of dumping 20+ loose `.dll`, `.pak`, `.dat`, and runtime files in the root folder, TubeFlow organizes the application cleanly:
```
TubeFlow/
├── app/                     <-- All internal Electron & Chromium dependencies tucked away
├── TubeFlow.exe             <-- Clean 1-click app launcher
└── Uninstall TubeFlow.exe   <-- Only ONE uninstaller (our improved GUI uninstaller)
```

---

## 📦 Setup & Installation Permissions

The **TubeFlow Setup** installer (`release/TubeFlow Setup 1.0.0.exe`) provides a dedicated permissions and configuration page during installation:
1. **Core Application**: Installs the TubeFlow desktop UI and background process.
2. **Engine Permissions**: Grants permission to run the bundled `yt-dlp` and `FFmpeg` engines for high-speed multi-stream downloads and audio extraction.
3. **Storage Access**: Authorizes folder creation in `%USERPROFILE%\Downloads\TubeFlow` for saved media.
4. **Desktop & Start Menu Shortcuts**: Generates quick access launch icons.

---

## 🗑️ 3-Tier Uninstaller Setup

TubeFlow provides 3 convenient ways to launch the improved GUI uninstaller:
- Double-click [`Uninstall TubeFlow.exe`](file:///D:/Code/YT%20Downloader/Uninstall%20TubeFlow.exe) in the application folder.
- Through the in-app **Settings -> Uninstall TubeFlow** wizard modal.
- Through **Windows Settings / Add or Remove Programs** (automatically opens our improved GUI uninstaller).

### Available Uninstallation Levels:
1. **Remove this app only (Standard Uninstall)**:
   - Removes TubeFlow application binaries and desktop/start shortcuts.
   - Preserves all downloaded videos, audio files, and engine libraries.
2. **Clean uninstall (App + yt-dlp + FFmpeg + Libraries + Caches)**:
   - Removes the app, yt-dlp, FFmpeg binaries, app data cache, and download history.
   - Safely preserves all your downloaded media files on disk.
3. **Total removal (Complete Purge of EVERYTHING)**:
   - Permanently deletes all app files, backend engines, caches, history, AND completely wipes all downloaded videos and audio inside `%USERPROFILE%\Downloads\TubeFlow`.
   - Includes safeguard confirmation to prevent accidental media loss.

---

## ✨ Features

- **🏠 Home Hub (Downloader Center)**
  - Paste any YouTube video, music, or short URL with instant auto-detection from clipboard.
  - Multi-stream video metadata analyzer displaying title, author, views, duration, and thumbnail preview.
  - **Best Recommended Mode**: One-click optimal settings combining the best 1080p/4K video stream with 320 kbps audio into a universal MP4 container.
  - **Custom Video Mode**: Choose exact resolution (4K 2160p, 2K 1440p, 1080p Full HD, 720p HD, 480p) with FPS and estimated filesize badges. Choose container (`MP4`, `MKV`, `WebM`).
  - **Audio Only Mode**: Extract high-fidelity audio tracks (`MP3`, `M4A`, `FLAC`, `WAV`, `AAC`) at bitrates up to 320 kbps.
  - Embed Subtitles (`.srt`) and Embed Thumbnail artwork toggles.
  - Destination directory selector with native file dialog browse button.

- **📥 Downloads Management & History**
  - Live progress tracking with percentage, download speed (e.g. `12.5 MB/s`), ETA, and byte counters.
  - Automatic FFmpeg merging stage notifications.
  - Card list styled after logistics tracker cards with coral-red highlight outlines, status badges, and channel info.
  - 1-click **Play Video** and **Show in Folder** actions upon completion.
  - Pause, Resume, Cancel, and Delete from history options.
  - Persistent history saved locally in `userData/tubeflow-downloads-history.json`.
  - Format Breakdown & Weekly Activity statistics matching the design inspiration.

- **🔮 More Tab**
  - Reserved blank module for future extensions (playlist batch downloads, video trimmers, subtitle translators).

- **⚙️ Settings & Engine Health**
  - Real-time verification of `yt-dlp` and `FFmpeg` binary availability and versions.
  - Change default download location.
  - Clear history with 1 click.

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 45
- **Frontend UI**: React 19, TypeScript, Tailwind CSS, Lucide React
- **Packaging Engine**: Electron Builder (`win-unpacked`, `portable`)
- **Downloader Engine**: yt-dlp (`v2026.10.26`)
- **Muxing & Audio Codec**: FFmpeg (`v9.0.2`)

---

## 🚀 Development Commands (Optional)

```bash
# Package the standalone application
npm run package

# Build a single-file portable .exe
npm run package:exe

# Run in live development mode with Vite hot reload
npm run dev
```
