# APK Testing & Deployment Guide

## ✅ APK File Status: READY FOR TESTING

### File Information

- **Filename**: `inheritance-pro-v5-debug.apk`
- **Size**: 4.3 MB
- **Build Date**: February 5, 2026
- **Status**: ✅ Valid & Ready for Testing
- **Type**: Debug Build (APK Signing Block present)

### APK Integrity Check Results

- ✅ ZIP archive structure: Valid
- ✅ All DEX files present: classes.dex, classes2-6.dex
- ✅ Android Manifest: Present and configured
- ✅ Web assets: Present (index.html, CSS, JavaScript)
- ✅ Capacitor configuration: Embedded
- ✅ APK signing: Present (debug certificate)

## App Configuration Details

### App Information

- **App ID**: `com.inheritance.pro`
- **App Name**: نظام المواريث (Islamic Inheritance System)
- **Version Code**: 1
- **Version Name**: 1.0

### System Requirements

- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 15 (API 36)
- **Compile SDK**: API 36
- **Architecture**: Multi-architecture (ARM, x86, etc.)

### Web Content Bundled

- ✅ index.html (87 lines, 360 KB)
- ✅ JavaScript bundle (index-BviZ-dCz.js)
- ✅ CSS bundle (index-CZb5ob0z.css)
- ✅ Capacitor plugins and native bridge
- ✅ Debug collector and configuration files

### Capacitor Configuration

```json
{
  "appId": "com.inheritance.pro",
  "appName": "نظام المواريث",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {}
}
```

## How to Test on Physical Device

### Prerequisites

1. **Android Device**: Running Android 7.0 or higher
2. **Developer Mode**: Enabled on the device
3. **USB Debugging**: Enabled
4. **USB Cable**: For connecting device to computer

### Installation Methods

#### Method 1: Using ADB (Recommended)

```bash
# Connect your Android device via USB
# Verify device is connected
adb devices

# Install the APK
adb install inheritance-pro-v5-debug.apk

# Launch the app
adb shell am start -n com.inheritance.pro/.MainActivity
```

#### Method 2: Manual Installation

1. Transfer `inheritance-pro-v5-debug.apk` to your Android device
2. Open file manager on device
3. Navigate to the APK file
4. Tap to install
5. Grant permissions if prompted
6. Launch from app drawer

#### Method 3: Using Android Studio

1. Open Android Studio
2. Go to: Build → Analyze APK
3. Select the APK file
4. Or use: Device Manager → Install APK

## Features to Test

### Core Functionality

- [ ] App launches successfully
- [ ] UI is displayed correctly (Arabic RTL support)
- [ ] All tabs are accessible (Estate, Heirs, Results)
- [ ] Input fields respond to touch

### Calculation Engine

- [ ] Change madhab preference
- [ ] Enter estate data (total, funeral, debts, wills)
- [ ] Enter heirs information
- [ ] Click Calculate button
- [ ] Verify results display
- [ ] Check calculation steps

### UI Components

- [ ] Dropdown menus work
- [ ] Input validation
- [ ] Scroll areas function properly
- [ ] Results table displays correctly
- [ ] Dark/Light theme switching (if enabled)

### Device Specific

- [ ] Touch responsiveness
- [ ] Orientation changes (portrait/landscape)
- [ ] Back button behavior
- [ ] Memory usage is reasonable
- [ ] No crashes during operation

## Important Notes

### Debug Build Characteristics

✓ This is a **DEBUG build** compiled with:

- Debug certificate (not production signed)
- Can only be installed on test devices
- Larger file size than release builds
- Better debugging capabilities

### What's NOT Included

- ❌ Production signing certificate
- ❌ Google Play Store compatibility (yet)
- ❌ App Store distribution
- ❌ Release optimizations

### To Create Production Build

When ready for production/Play Store:

```bash
# Generate release signing key
keytool -genkey -v -keystore inheritance-pro-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 -alias alias_name

# Build release APK
cd android
./gradlew assembleRelease

# Sign with key
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore inheritance-pro-release.keystore app-release-unsigned.apk alias_name

# Align
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Troubleshooting

### Installation Fails

- ✓ Enable "Unknown Sources" in device settings
- ✓ Check Android version is 7.0+ (API 24+)
- ✓ Clear cache: Settings → Apps → inheritance-pro → Storage → Clear Cache
- ✓ Try removing old version first

### App Crashes on Launch

- ✓ Check device has internet permission
- ✓ View logs: `adb logcat`
- ✓ Check device storage space
- ✓ Restart device

### Features Not Working

- ✓ Ensure JavaScript is enabled
- ✓ Check device has enough RAM
- ✓ Verify touch screen calibration
- ✓ Check console: `adb shell`

### Performance Issues

- ✓ Close background apps
- ✓ Clear device cache
- ✓ Restart device
- ✓ Check device storage (needs 100MB+ free)

## Device Requirements Summary

| Requirement     | Specification      | Status        |
| --------------- | ------------------ | ------------- |
| Minimum Android | 7.0 (API 24)       | ✅ Configured |
| Target Android  | 15 (API 36)        | ✅ Modern     |
| RAM             | 2GB minimum        | ✅ Typical    |
| Storage         | 100MB+ free space  | ✅ APK 4.3MB  |
| Processor       | Any ARM/x86        | ✅ Multi-arch |
| Screen          | Touch screen       | ✅ Required   |

## Quality Assurance Checklist

- ✅ APK file integrity verified
- ✅ All assets bundled correctly
- ✅ Proper manifest configuration
- ✅ Capacitor plugins configured
- ✅ Web assets optimized
- ✅ Debug signing present
- ✅ Target SDK modern (API 36)
- ✅ Multi-architecture support

## Next Steps

1. **Transfer APK** to physical device or USB
2. **Install** using one of the methods above
3. **Test** all features listed in checklist
4. **Report** any issues with screenshots/logs
5. **Optimize** for production if needed

## Support & Resources

- **APK Location**: `/workspaces/inheritance-pro-v5-debug.apk`
- **Source Code**: [GitHub Repository](https://github.com/MohammedAlmaqan/inheritance-pro-v5)
- **Capacitor Docs**: [Capacitor Android](https://capacitorjs.com/docs/android)
- **Google Play Guide**: [Google Play Core](https://developer.android.com/guide/playcore)

---

**Status**: Ready for Testing ✅
**Last Updated**: February 6, 2026
