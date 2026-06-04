Add-Type -AssemblyName System.Drawing

$inputPath = "D:\Projects\zeyin\assets\images\logo.jpg"
$outputPath = "D:\Projects\zeyin\assets\images\logo_cropped.jpg"

if (-not (Test-Path $inputPath)) {
    Write-Error "Input file not found: $inputPath"
    exit 1
}

Write-Host "Loading image..."
$src = [System.Drawing.Image]::FromFile($inputPath)
$bmp = New-Object System.Drawing.Bitmap($src)

$width = $bmp.Width
$height = $bmp.Height
Write-Host "Image size: $width x $height"

$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

# Step size to speed up scanning
$step = 15

Write-Host "Scanning pixels..."
for ($y = 0; $y -lt $height; $y += $step) {
    for ($x = 0; $x -lt $width; $x += $step) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if the pixel is not white (threshold 250)
        if ($pixel.R -lt 250 -or $pixel.G -lt 250 -or $pixel.B -lt 250) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# If no non-white pixels found, use default full image
if ($minX -ge $width -or $minY -ge $height) {
    Write-Host "No non-white pixels found. Skipping cropping."
    $src.Dispose()
    $bmp.Dispose()
    exit 0
}

# Add a 60px padding margin around the cropped area
$padding = 60
$minX = [Math]::Max(0, $minX - $padding)
$minY = [Math]::Max(0, $minY - $padding)
$maxX = [Math]::Min($width - 1, $maxX + $padding)
$maxY = [Math]::Min($height - 1, $maxY + $padding)

$cropWidth = $maxX - $minX
$cropHeight = $maxY - $minY

Write-Host "Bounding box: ($minX, $minY) to ($maxX, $maxY)"
Write-Host "New size: $cropWidth x $cropHeight"

# Create new cropped bitmap
$rect = New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)
$croppedBmp = $bmp.Clone($rect, $bmp.PixelFormat)

# Save the cropped image
Write-Host "Saving cropped image to $outputPath..."
$croppedBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up resources
$src.Dispose()
$bmp.Dispose()
$croppedBmp.Dispose()
Write-Host "Successfully cropped!"
