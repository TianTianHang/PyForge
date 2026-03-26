# Download uv binary for bundling with Tauri (Windows)
# Usage: .\download-uv.ps1 <target-triple>
# Example:
#   .\download-uv.ps1 x86_64-pc-windows-msvc

param(
    [Parameter(Mandatory=$true)]
    [string]$TargetTriple
)

$ErrorActionPreference = "Stop"

# Supported targets
$supportedTargets = @("x86_64-pc-windows-msvc")

if ($supportedTargets -notcontains $TargetTriple) {
    Write-Error "Unsupported target triple: $TargetTriple"
    Write-Host "Supported targets: x86_64-pc-windows-msvc"
    exit 1
}

# Set paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$VersionFile = Join-Path $ProjectRoot "src-tauri\uv-version.txt"
$BinariesDir = Join-Path $ProjectRoot "src-tauri\binaries"

# Read uv version
if (-not (Test-Path $VersionFile)) {
    Write-Error "Version file not found: $VersionFile"
    exit 1
}

$UVVersion = Get-Content $VersionFile -Raw
$UVVersion = $UVVersion.Trim()
Write-Host "Downloading uv version $UVVersion for $TargetTriple"

# Create binaries directory
New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null

# Determine the download URL (Windows archives are .zip files)
$UVArchFilename = "uv-$TargetTriple"
$UVFilename = "uv-$TargetTriple"
$DownloadUrl = "https://github.com/astral-sh/uv/releases/download/$UVVersion/$UVArchFilename.zip"
$ArchivePath = "$env:TEMP\$UVArchFilename.zip"
$DestPath = Join-Path $BinariesDir "$UVFilename.exe"

Write-Host "Downloading from: $DownloadUrl"
Write-Host "Saving to: $DestPath"

# Download the archive
Invoke-WebRequest -Uri $DownloadUrl -OutFile $ArchivePath -UseBasicParsing

# Extract the archive
Write-Host "Extracting archive..."
$TempDir = Join-Path $env:TEMP "uv-extract-$UVVersion"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
Expand-Archive -Path $ArchivePath -DestinationPath $TempDir -Force

# Find and move the uv binary
$ExtractedBinary = Get-ChildItem -Path $TempDir -Recurse -Filter "uv.exe" | Select-Object -First 1
if (-not $ExtractedBinary) {
    Write-Error "Could not find uv.exe in extracted archive"
    exit 1
}

Write-Host "Moving binary from: $($ExtractedBinary.FullName)"
Move-Item -Path $ExtractedBinary.FullName -Destination $DestPath -Force

# Cleanup
Remove-Item -Path $TempDir -Recurse -Force
Remove-Item -Path $ArchivePath -Force

Write-Host "Successfully downloaded $UVFilename to $DestPath"
Write-Host "Done!"
