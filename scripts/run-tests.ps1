# Requires PowerShell
param(
    [switch]$SkipInstall
)

Write-Host "[setup] Starting unified Playwright + Cucumber run" -ForegroundColor Cyan

$ErrorActionPreference = 'Stop'

function Exec($cmd) {
    Write-Host "[exec] $cmd" -ForegroundColor DarkGray
    & powershell -NoProfile -ExecutionPolicy Bypass -Command $cmd
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
}

if (-not $SkipInstall) {
    if (Test-Path package-lock.json) {
        Exec "npm ci"
    } else {
        Exec "npm install"
    }
}

# Ensure Playwright browsers are installed
Exec "npx playwright install --with-deps | cat"

# Run Playwright tests first (if any test files exist under tests with .spec.)
$hasPlaywright = Get-ChildItem -Path "tests" -Recurse -Include *.spec.ts,*.spec.js -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $hasPlaywright) {
    Exec "npx playwright test | cat"
} else {
    Write-Host "[playwright] No *.spec.* tests found. Skipping." -ForegroundColor Yellow
}

# Run Cucumber features using local config
$hasFeatures = Get-ChildItem -Path "tests/features" -Recurse -Include *.feature -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $hasFeatures) {
    $cukeCmd = "npx cucumber-js --config cucumber.cjs | cat"
    Exec $cukeCmd
} else {
    Write-Host "[cucumber] No feature files found. Skipping." -ForegroundColor Yellow
}

Write-Host "[done] All tasks completed" -ForegroundColor Green


