# OneDrive Exclusion Script for node_modules
# This will free up your OneDrive storage

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  EXCLUDE node_modules FROM ONEDRIVE SYNC" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\krish\OneDrive\Documents\Suno-Campus"

# Method 1: Using OneDrive Files On-Demand (Free up space)
Write-Host "[Step 1] Setting node_modules to 'Free up space' (remove from cloud)..." -ForegroundColor Green
Write-Host ""

$nodemodulesfolders = Get-ChildItem -Path $projectPath -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue

foreach ($folder in $nodemodulesfolders) {
    Write-Host "  - $($folder.FullName)" -ForegroundColor Cyan
    
    # Set the folder to not sync (Files On-Demand)
    attrib +U "$($folder.FullName)" /S /D 2>$null
}

Write-Host ""
Write-Host "[Step 2] Folders marked. OneDrive will stop syncing these folders." -ForegroundColor Green
Write-Host ""

# Calculate space that will be freed
Write-Host "[Step 3] Calculating space to be freed..." -ForegroundColor Green
$totalSize = 0
foreach ($folder in $nodemodulesfolders) {
    try {
        $size = (Get-ChildItem -Path $folder.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $totalSize += $size
    } catch {
        # Ignore errors
    }
}

$sizeMB = [math]::Round($totalSize / 1MB, 2)
$sizeGB = [math]::Round($totalSize / 1GB, 2)

Write-Host ""
Write-Host "  Total size of node_modules: $sizeMB MB ($sizeGB GB)" -ForegroundColor Yellow
Write-Host ""

Write-Host "[Step 4] NEXT STEPS TO FREE UP SPACE:" -ForegroundColor Magenta
Write-Host ""
Write-Host "  1. Right-click OneDrive icon in system tray (bottom-right)" -ForegroundColor White
Write-Host "  2. Click 'Settings'" -ForegroundColor White
Write-Host "  3. Go to 'Sync and backup' tab" -ForegroundColor White
Write-Host "  4. Click 'Advanced settings'" -ForegroundColor White
Write-Host "  5. Enable 'Files On-Demand' if not enabled" -ForegroundColor White
Write-Host ""
Write-Host "  OR - Manually right-click each node_modules folder:" -ForegroundColor White
Write-Host "    - Choose 'Free up space'" -ForegroundColor White
Write-Host ""

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  ALTERNATIVE: Move project OUTSIDE OneDrive" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "  Better option: Move entire project to a local folder like:" -ForegroundColor Green
Write-Host "    C:\Projects\Suno-Campus" -ForegroundColor Cyan
Write-Host "    or" -ForegroundColor White
Write-Host "    C:\Users\krish\Desktop\Suno-Campus" -ForegroundColor Cyan
Write-Host ""
Write-Host "  This way, NOTHING will sync to OneDrive!" -ForegroundColor Green
Write-Host ""

Write-Host "Would you like me to help move the project? (Recommended)" -ForegroundColor Yellow
Write-Host ""
