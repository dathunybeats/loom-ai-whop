# 🎬 FFmpeg Setup for Video Personalization

## Current Status
Your video personalization system is **working with screenshots** but needs FFmpeg to create the circular video overlays.

## What's Working Now ✅
- ✅ **Website scraping** with ScreenshotOne
- ✅ **Screenshot capture** and storage
- ✅ **Base video playback**
- ✅ **Console logging** showing screenshot URLs
- ✅ **Database storage** of prospect data

## What Needs FFmpeg 🎯
- 🔄 **Circular video cropping**
- 🔄 **Video overlay composition**
- 🔄 **Scrolling background animation**

## Install FFmpeg (Windows)

### Option 1: Chocolatey (Recommended)
```powershell
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg
```

### Option 2: Manual Installation
1. Download FFmpeg from: https://ffmpeg.org/download.html#build-windows
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable
4. Restart your terminal/IDE

### Option 3: Package Manager
```powershell
# Using winget
winget install ffmpeg

# Or using scoop
scoop install ffmpeg
```

## Verify Installation
```bash
ffmpeg -version
```

You should see version information if installed correctly.

## After Installation
1. **Restart your development server** (`npm run dev`)
2. **Test video personalization** - the system will automatically detect FFmpeg
3. **Check console logs** for FFmpeg status

## Expected Workflow After FFmpeg
1. User uploads base video ✅
2. User uploads prospects CSV ✅
3. User clicks "Start Personalizing" ✅
4. System scrapes website screenshots ✅
5. **NEW**: System crops video into circle 🔄
6. **NEW**: System creates scrolling background 🔄
7. **NEW**: System overlays circular video 🔄
8. **NEW**: System uploads composed video 🔄
9. User sees personalized video with circular overlay 🎯

## Current Fallback
Without FFmpeg, the system uses your base video directly while showing helpful installation instructions in the console.

## Test Command
After installing FFmpeg, test the video personalization to see the new composed videos!
