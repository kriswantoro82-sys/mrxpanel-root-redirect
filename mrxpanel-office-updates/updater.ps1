param([switch]$Force)
$ErrorActionPreference = "Stop"
$BaseUrl = "https://raw.githubusercontent.com/kriswantoro82-sys/mrxpanel-root-redirect/main/mrxpanel-office-updates"
$HermesHome = Join-Path $env:LOCALAPPDATA "hermes"
$PluginDir = Join-Path $HermesHome "desktop-plugins\mrxpanel-office"
$PluginFile = Join-Path $PluginDir "plugin.js"
$UpdaterHome = Join-Path $HermesHome "mrxpanel-office-updater"
$StateFile = Join-Path $UpdaterHome "state.json"
$Now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

New-Item -ItemType Directory -Force -Path $PluginDir,$UpdaterHome | Out-Null
$manifest = Invoke-RestMethod -Uri "$BaseUrl/manifest.json?ts=$Now" -Headers @{"Cache-Control"="no-cache"}
$currentVersion = $null
if (Test-Path $StateFile) {
  try { $currentVersion = (Get-Content $StateFile -Raw | ConvertFrom-Json).version } catch {}
}
if (-not $Force -and $currentVersion -eq $manifest.version -and (Test-Path $PluginFile)) { exit 0 }

$tmp = Join-Path $env:TEMP "mrxpanel-office-plugin-$Now.js"
Invoke-WebRequest -UseBasicParsing -Uri "$($manifest.plugin_url)?ts=$Now" -OutFile $tmp
$actual = (Get-FileHash $tmp -Algorithm SHA256).Hash.ToLowerInvariant()
$expected = ([string]$manifest.sha256).ToLowerInvariant()
if ($actual -ne $expected) {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  throw "MRXPANEL OFFICE update hash mismatch. Expected $expected, got $actual"
}
if (Test-Path $PluginFile) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  Copy-Item $PluginFile "$PluginFile.backup-$stamp" -Force
}
Move-Item $tmp $PluginFile -Force
@{
  version = [string]$manifest.version
  sha256 = $actual
  updated_at = (Get-Date).ToString("o")
  source = $BaseUrl
} | ConvertTo-Json | Set-Content $StateFile -Encoding UTF8
