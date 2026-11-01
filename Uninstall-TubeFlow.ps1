# TubeFlow Complete Uninstallation Wizard
# Provides 3-tier uninstall options matching user requirements

$ErrorActionPreference = "Continue"

Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "            TubeFlow Desktop App - Uninstaller Setup            " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please select your desired uninstallation option:" -ForegroundColor Yellow
Write-Host ""
Write-Host " [1] Standard Removal" -ForegroundColor Green
Write-Host "     - Removes the TubeFlow desktop application files and shortcuts only."
Write-Host "     - Keeps downloaded media and backend engines intact."
Write-Host ""
Write-Host " [2] Clean Uninstall (App + yt-dlp + FFmpeg + Libraries + Caches)" -ForegroundColor Yellow
Write-Host "     - Removes TubeFlow app, yt-dlp, FFmpeg, caches, and download history."
Write-Host "     - Preserves all your downloaded videos and audio files."
Write-Host ""
Write-Host " [3] Total Removal (Complete Purge of EVERYTHING)" -ForegroundColor Red
Write-Host "     - Removes application, yt-dlp, FFmpeg, caches, configs, AND"
Write-Host "       permanently wipes all downloaded videos and audio from TubeFlow!"
Write-Host ""
Write-Host " [Q] Cancel & Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter option number [1, 2, 3, or Q]"

$appDir = $PSScriptRoot
$userProfile = [System.Environment]::GetFolderPath('UserProfile')
$defaultDownloadDir = Join-Path $userProfile "Downloads\TubeFlow"
$appDataDir = Join-Path [System.Environment]::GetFolderPath('ApplicationData') "TubeFlow"
$localAppDataDir = Join-Path [System.Environment]::GetFolderPath('LocalApplicationData') "TubeFlow"
$localUpdaterDir = Join-Path [System.Environment]::GetFolderPath('LocalApplicationData') "tubeflow-updater"
$historyFile1 = Join-Path [System.Environment]::GetFolderPath('ApplicationData') "tubeflow-downloads-history.json"
$historyFile2 = Join-Path [System.Environment]::GetFolderPath('LocalApplicationData') "tubeflow-downloads-history.json"
$desktopShortcut = Join-Path [System.Environment]::GetFolderPath('Desktop') "TubeFlow.lnk"
$localShortcut = Join-Path $appDir "TubeFlow.lnk"

# Stop any running instances of TubeFlow, yt-dlp, or ffmpeg
Write-Host "`nStopping any running TubeFlow or yt-dlp processes..." -ForegroundColor DarkGray
Get-Process -Name "TubeFlow", "yt-dlp", "ffmpeg" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

switch ($choice) {
    "1" {
        Write-Host "`n---> Starting Standard Removal..." -ForegroundColor Cyan
        
        # Remove desktop shortcuts
        if (Test-Path $desktopShortcut) { Remove-Item -Path $desktopShortcut -Force }
        if (Test-Path $localShortcut) { Remove-Item -Path $localShortcut -Force }
        
        # Check for NSIS uninstaller executable
        $nsisUninstaller = Join-Path $appDir "Uninstall TubeFlow.exe"
        if (Test-Path $nsisUninstaller) {
            Start-Process -FilePath $nsisUninstaller -Wait
        } else {
            Write-Host "Shortcuts removed. Application folder can now be deleted if desired." -ForegroundColor Green
        }
        
        Write-Host "`n[SUCCESS] Standard uninstall completed! (Your downloaded media was untouched)." -ForegroundColor Green
    }
    
    "2" {
        Write-Host "`n---> Starting Clean Uninstall..." -ForegroundColor Yellow
        
        # Remove shortcuts
        if (Test-Path $desktopShortcut) { Remove-Item -Path $desktopShortcut -Force }
        if (Test-Path $localShortcut) { Remove-Item -Path $localShortcut -Force }

        # Remove app data and caches
        if (Test-Path $appDataDir) { Remove-Item -Path $appDataDir -Recurse -Force -ErrorAction SilentlyContinue }
        if (Test-Path $localAppDataDir) { Remove-Item -Path $localAppDataDir -Recurse -Force -ErrorAction SilentlyContinue }
        if (Test-Path $localUpdaterDir) { Remove-Item -Path $localUpdaterDir -Recurse -Force -ErrorAction SilentlyContinue }
        if (Test-Path $historyFile1) { Remove-Item -Path $historyFile1 -Force -ErrorAction SilentlyContinue }
        if (Test-Path $historyFile2) { Remove-Item -Path $historyFile2 -Force -ErrorAction SilentlyContinue }

        # Remove yt-dlp and ffmpeg if in bin
        $binDir = Join-Path $appDir "bin"
        if (Test-Path $binDir) {
            Write-Host "Removing yt-dlp and ffmpeg binaries from $binDir..." -ForegroundColor DarkGray
            Remove-Item -Path (Join-Path $binDir "yt-dlp.exe") -Force -ErrorAction SilentlyContinue
            Remove-Item -Path (Join-Path $binDir "ffmpeg.exe") -Force -ErrorAction SilentlyContinue
        }

        # Check for NSIS uninstaller
        $nsisUninstaller = Join-Path $appDir "Uninstall TubeFlow.exe"
        if (Test-Path $nsisUninstaller) {
            Start-Process -FilePath $nsisUninstaller -Wait
        }

        Write-Host "`n[SUCCESS] Clean uninstall completed! yt-dlp, FFmpeg, caches, and configs removed." -ForegroundColor Green
        Write-Host "Note: Your downloaded videos in '$defaultDownloadDir' are preserved." -ForegroundColor Cyan
    }

    "3" {
        Write-Host "`n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
        Write-Host "                      CRITICAL WARNING                          " -ForegroundColor White -BackgroundColor DarkRed
        Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
        Write-Host "This will permanently ERASE all downloaded videos and audio in:" -ForegroundColor Red
        Write-Host "  $defaultDownloadDir" -ForegroundColor Yellow
        Write-Host "as well as all application binaries, yt-dlp, FFmpeg, and caches!" -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Type 'CONFIRM' (all caps) to proceed with TOTAL REMOVAL"
        
        if ($confirm -ceq "CONFIRM") {
            Write-Host "`n---> Starting TOTAL REMOVAL..." -ForegroundColor Red
            
            # Remove downloaded media
            if (Test-Path $defaultDownloadDir) {
                Write-Host "Purging all downloaded videos and audio from $defaultDownloadDir..." -ForegroundColor DarkRed
                Remove-Item -Path $defaultDownloadDir -Recurse -Force -ErrorAction SilentlyContinue
            }

            # Remove shortcuts
            if (Test-Path $desktopShortcut) { Remove-Item -Path $desktopShortcut -Force }
            if (Test-Path $localShortcut) { Remove-Item -Path $localShortcut -Force }

            # Remove app data and caches
            if (Test-Path $appDataDir) { Remove-Item -Path $appDataDir -Recurse -Force -ErrorAction SilentlyContinue }
            if (Test-Path $localAppDataDir) { Remove-Item -Path $localAppDataDir -Recurse -Force -ErrorAction SilentlyContinue }
            if (Test-Path $localUpdaterDir) { Remove-Item -Path $localUpdaterDir -Recurse -Force -ErrorAction SilentlyContinue }
            if (Test-Path $historyFile1) { Remove-Item -Path $historyFile1 -Force -ErrorAction SilentlyContinue }
            if (Test-Path $historyFile2) { Remove-Item -Path $historyFile2 -Force -ErrorAction SilentlyContinue }

            # Remove bin binaries
            $binDir = Join-Path $appDir "bin"
            if (Test-Path $binDir) {
                Remove-Item -Path (Join-Path $binDir "yt-dlp.exe") -Force -ErrorAction SilentlyContinue
                Remove-Item -Path (Join-Path $binDir "ffmpeg.exe") -Force -ErrorAction SilentlyContinue
            }

            Write-Host "`n[SUCCESS] Total removal complete: Everything including downloaded media has been purged." -ForegroundColor Green
        } else {
            Write-Host "`nConfirmation did not match 'CONFIRM'. Aborting Total Removal." -ForegroundColor Yellow
        }
    }

    Default {
        Write-Host "`nCancelled. No changes were made." -ForegroundColor Gray
    }
}
