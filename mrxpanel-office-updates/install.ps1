$ErrorActionPreference = "Stop"
$BaseUrl = "https://raw.githubusercontent.com/kriswantoro82-sys/mrxpanel-root-redirect/main/mrxpanel-office-updates"
$HermesHome = Join-Path $env:LOCALAPPDATA "hermes"
$UpdaterHome = Join-Path $HermesHome "mrxpanel-office-updater"
$Updater = Join-Path $UpdaterHome "updater.ps1"
New-Item -ItemType Directory -Force -Path $UpdaterHome | Out-Null

Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/updater.ps1?ts=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" -OutFile $Updater
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Updater -Force

$taskName = "MRXPANEL Office Updater"
$taskCmd = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Updater`""
& schtasks.exe /Create /F /SC MINUTE /MO 15 /TN $taskName /TR $taskCmd | Out-Null

$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
New-Item -Path $runKey -Force | Out-Null
New-ItemProperty -Path $runKey -Name "MRXPANEL Office Updater" -Value $taskCmd -PropertyType String -Force | Out-Null

Write-Host ""
Write-Host "MRXPANEL OFFICE Self-Updater installed." -ForegroundColor Green
Write-Host "Update check: every 15 minutes + Windows login."
Write-Host "If Hermes is open, use Ctrl+K -> Reload desktop plugins once after this first install."
