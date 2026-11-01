!include nsDialogs.nsh
!include LogicLib.nsh

; =============================================================
; INSTALLER SECTION (Only included during installer build)
; =============================================================
!ifndef BUILD_UNINSTALLER
  !macro customInstall
    DetailPrint "Configuring clean application directory structure..."

    ; 1. Create app directory
    CreateDirectory "$INSTDIR\app"

    ; 2. Move internal folders into app directory
    Rename "$INSTDIR\locales" "$INSTDIR\app\locales"
    Rename "$INSTDIR\resources" "$INSTDIR\app\resources"

    ; 3. Move internal runtime files into app directory
    Rename "$INSTDIR\chrome_100_percent.pak" "$INSTDIR\app\chrome_100_percent.pak"
    Rename "$INSTDIR\chrome_200_percent.pak" "$INSTDIR\app\chrome_200_percent.pak"
    Rename "$INSTDIR\d3dcompiler_47.dll" "$INSTDIR\app\d3dcompiler_47.dll"
    Rename "$INSTDIR\dxcompiler.dll" "$INSTDIR\app\dxcompiler.dll"
    Rename "$INSTDIR\electron_wer.dll" "$INSTDIR\app\electron_wer.dll"
    Rename "$INSTDIR\ffmpeg.dll" "$INSTDIR\app\ffmpeg.dll"
    Rename "$INSTDIR\icudtl.dat" "$INSTDIR\app\icudtl.dat"
    Rename "$INSTDIR\LICENSE.electron.txt" "$INSTDIR\app\LICENSE.electron.txt"
    Rename "$INSTDIR\LICENSES.chromium.html" "$INSTDIR\app\LICENSES.chromium.html"
    Rename "$INSTDIR\resources.pak" "$INSTDIR\app\resources.pak"
    Rename "$INSTDIR\snapshot_blob.bin" "$INSTDIR\app\snapshot_blob.bin"
    Rename "$INSTDIR\v8_context_snapshot.bin" "$INSTDIR\app\v8_context_snapshot.bin"
    Rename "$INSTDIR\vk_swiftshader.dll" "$INSTDIR\app\vk_swiftshader.dll"
    Rename "$INSTDIR\vk_swiftshader_icd.json" "$INSTDIR\app\vk_swiftshader_icd.json"
    Rename "$INSTDIR\vulkan-1.dll" "$INSTDIR\app\vulkan-1.dll"

    ; 4. Move heavy Electron TubeFlow.exe into app directory
    Rename "$INSTDIR\TubeFlow.exe" "$INSTDIR\app\TubeFlow.exe"

    ; 5. Copy clean root launcher TubeFlow.exe to root
    CopyFiles /SILENT "$INSTDIR\app\resources\launcher\TubeFlow.exe" "$INSTDIR\TubeFlow.exe"

    ; 6. Replace generic uninstaller with our improved GUI uninstaller
    CopyFiles /SILENT "$INSTDIR\app\resources\uninstaller\Uninstall TubeFlow.exe" "$INSTDIR\Uninstall TubeFlow.exe"

    ; 7. Delete the duplicate uninstaller so only ONE uninstaller exists
    Delete "$INSTDIR\TubeFlow-Uninstaller.exe"
    Delete "$INSTDIR\app\TubeFlow-Uninstaller.exe"

    ; 8. Create clean shortcuts pointing to root launcher and improved GUI uninstaller
    CreateDirectory "$SMPROGRAMS\TubeFlow"
    CreateShortCut "$DESKTOP\TubeFlow.lnk" "$INSTDIR\TubeFlow.exe" "" "$INSTDIR\TubeFlow.exe" 0
    CreateShortCut "$SMPROGRAMS\TubeFlow\TubeFlow.lnk" "$INSTDIR\TubeFlow.exe" "" "$INSTDIR\TubeFlow.exe" 0
    CreateShortCut "$SMPROGRAMS\TubeFlow\Uninstall TubeFlow.lnk" "$INSTDIR\Uninstall TubeFlow.exe" "" "$INSTDIR\Uninstall TubeFlow.exe" 0

    ; 9. Run the engine installer script during installation
    DetailPrint "Configuring and verifying yt-dlp and FFmpeg media engines..."
    nsExec::Exec 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\app\resources\scripts\install-engines.ps1" -InstallDir "$INSTDIR\app\resources\bin"'
  !macroend
!endif

; =============================================================
; UNINSTALLER SECTION (Only included during uninstaller build)
; =============================================================
!ifdef BUILD_UNINSTALLER
  Var un.Dialog_Uninstall
  Var un.Hwnd_UnTitle
  Var un.Hwnd_UnDesc
  Var un.Hwnd_RadioStandard
  Var un.Hwnd_RadioClean
  Var un.Hwnd_RadioTotal
  Var un.Hwnd_NoteText
  Var un.UninstallMode ; "1": Standard, "2": Clean, "3": Total

  !macro customUninstallPage
    UninstPage custom un.CustomUninstallPage un.CustomUninstallPageLeave
  !macroend

  Function un.CustomUninstallPage
    nsDialogs::Create 1018
    Pop $un.Dialog_Uninstall
    ${If} $un.Dialog_Uninstall == error
      Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 0 100% 12u "Choose Uninstallation Level"
    Pop $un.Hwnd_UnTitle

    ${NSD_CreateLabel} 0 14u 100% 16u "Select how thoroughly you want to remove TubeFlow from your system:"
    Pop $un.Hwnd_UnDesc

    ; Option 1: Standard Removal
    ${NSD_CreateRadioButton} 10u 32u 90% 14u "1. Remove this app only (Standard Uninstall)"
    Pop $un.Hwnd_RadioStandard
    ${NSD_Check} $un.Hwnd_RadioStandard ; Default checked

    ${NSD_CreateLabel} 24u 48u 85% 14u "Removes TubeFlow app files and shortcuts. Keeps downloaded videos and engines intact."
    Pop $0

    ; Option 2: Clean Uninstall
    ${NSD_CreateRadioButton} 10u 64u 90% 14u "2. Clean uninstall (App + yt-dlp, FFmpeg, caches & libraries)"
    Pop $un.Hwnd_RadioClean

    ${NSD_CreateLabel} 24u 80u 85% 14u "Removes app, yt-dlp, FFmpeg, settings and history. Preserves your downloaded videos."
    Pop $0

    ; Option 3: Total Removal
    ${NSD_CreateRadioButton} 10u 96u 90% 14u "3. Total removal (Complete purge including all downloaded videos & audio)"
    Pop $un.Hwnd_RadioTotal

    ${NSD_CreateLabel} 24u 112u 85% 18u "WARNING: Completely wipes EVERYTHING including all downloaded media in your TubeFlow folder."
    Pop $un.Hwnd_NoteText

    StrCpy $un.UninstallMode "1"

    nsDialogs::Show
  FunctionEnd

  Function un.CustomUninstallPageLeave
    ${NSD_GetState} $un.Hwnd_RadioTotal $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $un.UninstallMode "3"
      MessageBox MB_YESNO|MB_ICONSTOP "TOTAL REMOVAL CONFIRMATION:$\n$\nThis will permanently delete ALL videos, music, and files inside your TubeFlow downloads directory!$\n$\nAre you completely sure you want to delete everything?" IDYES +2
      Abort
    ${Else}
      ${NSD_GetState} $un.Hwnd_RadioClean $0
      ${If} $0 == ${BST_CHECKED}
        StrCpy $un.UninstallMode "2"
      ${Else}
        StrCpy $un.UninstallMode "1"
      ${EndIf}
    ${EndIf}
  FunctionEnd

  !macro customUnInstall
    ; Always delete app subfolder, launcher, and shortcuts
    DetailPrint "Removing application files and shortcuts..."
    RMDir /r "$INSTDIR\app"
    Delete "$INSTDIR\TubeFlow.exe"
    Delete "$INSTDIR\Uninstall TubeFlow.exe"
    Delete "$INSTDIR\TubeFlow-Uninstaller.exe"
    Delete "$DESKTOP\TubeFlow.lnk"
    Delete "$SMPROGRAMS\TubeFlow\TubeFlow.lnk"
    Delete "$SMPROGRAMS\TubeFlow\Uninstall TubeFlow.lnk"
    RMDir "$SMPROGRAMS\TubeFlow"

    ${If} $un.UninstallMode == "3"
      ; Level 3: Total removal (Removes app, libraries, configs, and all downloaded media)
      DetailPrint "Executing Total Removal..."
      DetailPrint "Deleting downloaded media folder..."
      RMDir /r "$PROFILE\Downloads\TubeFlow"
      RMDir /r "$DOCUMENTS\..\Downloads\TubeFlow"
      
      DetailPrint "Deleting app configuration and history..."
      RMDir /r "$APPDATA\TubeFlow"
      RMDir /r "$LOCALAPPDATA\TubeFlow"
      RMDir /r "$LOCALAPPDATA\tubeflow-updater"
      Delete "$APPDATA\tubeflow-downloads-history.json"
      Delete "$LOCALAPPDATA\tubeflow-downloads-history.json"

    ${ElseIf} $un.UninstallMode == "2"
      ; Level 2: Clean uninstall (Removes app, libraries, cache and history, keeps downloaded videos)
      DetailPrint "Executing Clean Uninstall..."
      DetailPrint "Deleting app configuration and history..."
      RMDir /r "$APPDATA\TubeFlow"
      RMDir /r "$LOCALAPPDATA\TubeFlow"
      RMDir /r "$LOCALAPPDATA\tubeflow-updater"
      Delete "$APPDATA\tubeflow-downloads-history.json"
      Delete "$LOCALAPPDATA\tubeflow-downloads-history.json"

    ${Else}
      ; Level 1: Standard uninstall (Removes only app files in INSTDIR)
      DetailPrint "Executing Standard Uninstall..."
    ${EndIf}
  !macroend
!endif
