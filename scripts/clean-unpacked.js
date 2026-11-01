import * as fs from 'fs';
import * as path from 'path';

const unpackedDir = path.resolve('release', 'win-unpacked');
if (!fs.existsSync(unpackedDir)) {
  process.exit(0);
}

const appDir = path.join(unpackedDir, 'app');
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// Items to move into app/
const itemsToMove = [
  'locales',
  'resources',
  'chrome_100_percent.pak',
  'chrome_200_percent.pak',
  'd3dcompiler_47.dll',
  'dxcompiler.dll',
  'electron_wer.dll',
  'ffmpeg.dll',
  'icudtl.dat',
  'LICENSE.electron.txt',
  'LICENSES.chromium.html',
  'resources.pak',
  'snapshot_blob.bin',
  'v8_context_snapshot.bin',
  'vk_swiftshader.dll',
  'vk_swiftshader_icd.json',
  'vulkan-1.dll',
];

for (const item of itemsToMove) {
  const src = path.join(unpackedDir, item);
  const dest = path.join(appDir, item);
  if (fs.existsSync(src)) {
    try {
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
      fs.renameSync(src, dest);
    } catch (e) {
      console.warn(`Could not move ${item}:`, e.message);
    }
  }
}

// Move Electron TubeFlow.exe to app/TubeFlow.exe if it's the large file
const rootExe = path.join(unpackedDir, 'TubeFlow.exe');
const targetAppExe = path.join(appDir, 'TubeFlow.exe');
if (fs.existsSync(rootExe)) {
  const stat = fs.statSync(rootExe);
  if (stat.size > 1024 * 1024) { // Electron exe is ~240 MB
    try {
      if (fs.existsSync(targetAppExe)) fs.rmSync(targetAppExe, { force: true });
      fs.renameSync(rootExe, targetAppExe);
    } catch (e) {
      console.warn('Could not move TubeFlow.exe to app:', e.message);
    }
  }
}

// Copy clean root launcher TubeFlow.exe
const launcherSrc = path.resolve('build', 'launcher', 'TubeFlow.exe');
if (fs.existsSync(launcherSrc)) {
  fs.copyFileSync(launcherSrc, rootExe);
}

// Copy single improved GUI uninstaller Uninstall TubeFlow.exe
const uninstallerSrc = path.resolve('build', 'uninstaller_gui', 'Uninstall TubeFlow.exe');
const rootUninstaller = path.join(unpackedDir, 'Uninstall TubeFlow.exe');
if (fs.existsSync(uninstallerSrc)) {
  fs.copyFileSync(uninstallerSrc, rootUninstaller);
}

// Remove any duplicate uninstaller
const duplicateUninstaller = path.join(unpackedDir, 'TubeFlow-Uninstaller.exe');
if (fs.existsSync(duplicateUninstaller)) {
  try { fs.unlinkSync(duplicateUninstaller); } catch {}
}

console.log('Cleaned win-unpacked layout: app runtime files moved to app/, only TubeFlow.exe and Uninstall TubeFlow.exe in root.');
