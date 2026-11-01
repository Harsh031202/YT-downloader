param (
    [string]$InstallDir = ""
)

$ErrorActionPreference = "SilentlyContinue"

if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $userData = [Environment]::GetFolderPath([Environment+SpecialFolder]::ApplicationData)
    $InstallDir = Join-Path $userData "TubeFlow\bin"
}

if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$ytdlpTarget = Join-Path $InstallDir "yt-dlp.exe"
$ffmpegTarget = Join-Path $InstallDir "ffmpeg.exe"
$ffprobeTarget = Join-Path $InstallDir "ffprobe.exe"

# ========================================================
# 1. AUTO-CHECK: Is yt-dlp already present on the system?
# ========================================================
$ytdlpConfigured = $false

# 1a. Check existing target
if (Test-Path $ytdlpTarget) {
    try {
        $v = & $ytdlpTarget --version
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($v)) {
            $ytdlpConfigured = $true
            Write-Output "yt-dlp already installed and active at $ytdlpTarget ($v)"
        }
    } catch {}
}

# 1b. Check system PATH
if (-not $ytdlpConfigured) {
    try {
        $sysYt = Get-Command "yt-dlp" -ErrorAction SilentlyContinue
        if ($sysYt) {
            $v = & $sysYt.Source --version
            if ($LASTEXITCODE -eq 0) {
                Copy-Item $sysYt.Source -Destination $ytdlpTarget -Force
                $ytdlpConfigured = $true
                Write-Output "Detected and linked existing yt-dlp from system PATH ($v)"
            }
        }
    } catch {}
}

# 1c. Check Python Scripts across any user Python installations
if (-not $ytdlpConfigured) {
    $pythonRoot = Join-Path $env:APPDATA "Python"
    if (Test-Path $pythonRoot) {
        $pyCandidates = Get-ChildItem -Path $pythonRoot -Recurse -Filter "yt-dlp.exe" -ErrorAction SilentlyContinue
        foreach ($cand in $pyCandidates) {
            try {
                $v = & $cand.FullName --version
                if ($LASTEXITCODE -eq 0) {
                    Copy-Item $cand.FullName -Destination $ytdlpTarget -Force
                    $ytdlpConfigured = $true
                    Write-Output "Detected and linked yt-dlp from Python ($cand.FullName)"
                    break
                }
            } catch {}
        }
    }
}

# 1d. If not found anywhere on the system, download latest release
if (-not $ytdlpConfigured) {
    Write-Output "yt-dlp not detected on system. Downloading latest release from GitHub..."
    $ytdlpUrl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    $tempYt = Join-Path $env:TEMP "yt-dlp-dl.exe"
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($ytdlpUrl, $tempYt)
        Move-Item $tempYt $ytdlpTarget -Force
        $ytdlpConfigured = $true
        Write-Output "yt-dlp downloaded and installed successfully."
    } catch {
        try {
            Invoke-WebRequest -Uri $ytdlpUrl -OutFile $ytdlpTarget -UseBasicParsing
            $ytdlpConfigured = $true
            Write-Output "yt-dlp fetched via Invoke-WebRequest."
        } catch {
            Write-Warning "Could not download yt-dlp: $_"
        }
    }
}

# ========================================================
# 2. AUTO-CHECK: Is FFmpeg already present on the system?
# ========================================================
$ffmpegConfigured = $false

# 2a. Check existing target
if (Test-Path $ffmpegTarget) {
    try {
        $v = & $ffmpegTarget -version
        if ($LASTEXITCODE -eq 0) {
            $ffmpegConfigured = $true
            Write-Output "FFmpeg already installed and active at $ffmpegTarget"
        }
    } catch {}
}

# 2b. Check system PATH
if (-not $ffmpegConfigured) {
    try {
        $sysFf = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
        if ($sysFf) {
            Copy-Item $sysFf.Source -Destination $ffmpegTarget -Force
            $sysProbe = Get-Command "ffprobe" -ErrorAction SilentlyContinue
            if ($sysProbe) { Copy-Item $sysProbe.Source -Destination $ffprobeTarget -Force }
            $ffmpegConfigured = $true
            Write-Output "Detected and linked existing FFmpeg from system PATH."
        }
    } catch {}
}

# 2c. Check WinGet Packages
if (-not $ffmpegConfigured) {
    $wingetBase = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
    if (Test-Path $wingetBase) {
        $wingetFf = Get-ChildItem -Path $wingetBase -Recurse -Filter "ffmpeg.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($wingetFf) {
            Copy-Item $wingetFf.FullName -Destination $ffmpegTarget -Force
            $wingetProbe = Get-ChildItem -Path $wingetBase -Recurse -Filter "ffprobe.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($wingetProbe) { Copy-Item $wingetProbe.FullName -Destination $ffprobeTarget -Force }
            $ffmpegConfigured = $true
            Write-Output "Detected and linked FFmpeg from WinGet packages."
        }
    }
}

# 2d. If not found anywhere on the system, download standalone FFmpeg
if (-not $ffmpegConfigured) {
    Write-Output "FFmpeg not detected on system. Downloading standalone release..."
    $zipTemp = Join-Path $env:TEMP "ffmpeg-release.zip"
    $extractTemp = Join-Path $env:TEMP "ffmpeg_extract_$((Get-Date).Ticks)"
    $ffmpegUrl = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($ffmpegUrl, $zipTemp)
        Expand-Archive -Path $zipTemp -DestinationPath $extractTemp -Force
        
        $extractedFfmpeg = Get-ChildItem -Path $extractTemp -Recurse -Filter "ffmpeg.exe" | Select-Object -First 1
        $extractedProbe = Get-ChildItem -Path $extractTemp -Recurse -Filter "ffprobe.exe" | Select-Object -First 1
        
        if ($extractedFfmpeg) { Copy-Item $extractedFfmpeg.FullName -Destination $ffmpegTarget -Force }
        if ($extractedProbe) { Copy-Item $extractedProbe.FullName -Destination $ffprobeTarget -Force }
        
        Remove-Item $zipTemp -Force -ErrorAction SilentlyContinue
        Remove-Item $extractTemp -Recurse -Force -ErrorAction SilentlyContinue
        $ffmpegConfigured = $true
        Write-Output "FFmpeg downloaded and configured successfully."
    } catch {
        Write-Warning "Could not download FFmpeg: $_"
    }
}

Write-Output "Setup result: ytdlp=$ytdlpConfigured, ffmpeg=$ffmpegConfigured"
