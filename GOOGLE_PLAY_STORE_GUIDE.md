# Google Play Store Compatibility & Deployment Guide

## 📋 Pre-Submission Checklist

### App Information Requirements

- [ ] **App Name**: Inheritance Pro v5.0 (نظام المواريث)
- [ ] **Short Description**: (80 chars max)
  - "Professional Islamic inheritance calculator with 4 Islamic schools"
- [ ] **Full Description**: (4000 chars max)
  - Complete feature list, usage instructions, supported madhhabs
- [ ] **Category**: Utilities or Education
- [ ] **Content Rating**: Suitable for all ages
- [ ] **Privacy Policy**: Required URL
- [ ] **Support Email**: Required contact email
- [ ] **Website**: Optional but recommended
- [ ] **Phone Number**: Optional

### Visual Assets Required

- [ ] **App Icon**: 512 x 512 px, PNG/GIF/JPG
- [ ] **Screenshot (Min 2)**: 1080 x 1920 px or 1440 x 2560 px
  - Portrait orientation only
  - Show key features in use
  - Can have text overlays
- [ ] **Feature Graphic**: 1024 x 500 px
  - Showcase app's best features
  - Text optional
- [ ] **Video Preview**: Optional (up to 30 seconds)

## 🔒 Security & Storage Permissions

### Required Permissions for Google Play

#### Current (GOOD)
- `INTERNET`: For app functionality

#### May Need to Add
- `READ_EXTERNAL_STORAGE`: If users want to export results
- `WRITE_EXTERNAL_STORAGE`: For saving PDFs or reports
- `MANAGE_EXTERNAL_STORAGE`: For access to all files (Android 11+)

### Manifest Configuration

Update `/workspaces/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## 🔧 Build & Configuration Update

### Update Version Information

Edit `/workspaces/android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.inheritance.pro"
    minSdkVersion 24           // Keep as is
    targetSdkVersion 36        // Keep current
    versionCode 1              // Increment for each release
    versionName "1.0.0"        // Semantic versioning
}
```

### Create Release Build

```bash
# 1. Update version in build.gradle
# 2. Build signed release APK
cd android
./gradlew assembleRelease

# Or use Gradle Wrapper
./gradlew bundleRelease  # For App Bundle (recommended)
```

## 🔐 Production Signing Certificate

### Generate Keystore

```bash
# Generate signing key (do this once and keep it safe!)
keytool -genkey -v -keystore inheritance-pro-release.keystore \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -alias inheritance-pro \
  -dname "CN=Mohammed Almaqan,O=Personal,C=SA"

# Store password securely - you'll need it for each release
# Default: changeit (change this!)
```

### Configure Gradle Signing

Edit `/workspaces/android/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file('inheritance-pro-release.keystore')
        storePassword System.getenv("KEYSTORE_PASSWORD") 
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 
                      'proguard-rules.pro'
    }
}
```

### Build Signed APK/Bundle

```bash
# Method 1: Using environment variables
export KEYSTORE_PASSWORD="your-password"
export KEY_ALIAS="inheritance-pro"
export KEY_PASSWORD="your-password"

cd android
./gradlew bundleRelease

# Method 2: Interactive mode
./gradlew assembleRelease  # Will prompt for passwords
```

## 📱 Device & OS Requirements

### Minimum SDK Verification

- ✅ minSdkVersion: 24 (Android 7.0)
- ✅ targetSdkVersion: 36 (Android 15)
- ✅ compileSdkVersion: 36

### Supported Architectures

- ✅ ARM64-v8a (primary)
- ✅ ARMv7-a
- ✅ x86/x86_64 (optional)

Ensure in `android/app/build.gradle`:

```gradle
android {
  ...
  splits {
    abi {
      enable true
      reset()
      include "armeabi-v7a", "arm64-v8a"
      universalApk true
    }
  }
}
```

## 🌐 Privacy Policy Requirement

### Create Privacy Policy

Create `/workspaces/PRIVACY_POLICY.md`:

```markdown
# Privacy Policy - Inheritance Pro v5.0

## Data Collection
- We do NOT collect personal data
- All calculations are done locally on your device
- No server storage of user data

## Permissions
- INTERNET: For downloading content (if needed)
- STORAGE: Optional, for exporting results

## Third-Party Services
- Capacitor: Native bridge (open source)
- React: UI framework (open source)

## Changes to This Policy
We may update this policy periodically.

Last Updated: February 6, 2026
```

Publish at: `https://github.com/MohammedAlmaqan/inheritance-pro-v5/blob/main/PRIVACY_POLICY.md`

## 📊 App Store Listing

### Promotional Text

```
Inheritance Pro v5.0 is a professional Islamic inheritance calculator
that implements the fiqh rules of all four Islamic schools of thought.

FEATURES:
✓ Support for 4 Islamic schools (Hanafi, Maliki, Shafi'i, Hanbali)
✓ Complete heir calculation system
✓ Precise fraction-based calculations
✓ Special case handling (awl, radd, hijab)
✓ Detailed calculation steps in Arabic
✓ No internet required - fully offline
✓ Beautiful, intuitive interface
```

## 📋 Compliance Requirements

### Content Rating Questionnaire

1. **Violence & Harming**: None
2. **Sexual Content**: None
3. **Mature Themes**: None
4. **Drugs/Alcohol**: None
5. **Gambling**: None
6. **Ads**: Specify if you'll include ads
7. **Commercial Transaction**: None
8. **Malware**: None
9. **Tracking**: None (specify if analytics used)

### Acceptable Uses

- ✅ Religious/Educational
- ✅ Personal use
- ✅ Financial learning
- ✅ No gambling implications

## 🚀 Release Process

### Step 1: Prepare Release

```bash
# Update version
sed -i 's/versionCode.*/versionCode 2/' android/app/build.gradle
sed -i 's/versionName.*/versionName "1.0.1"/' android/app/build.gradle

# Commit
git add -A
git commit -m "chore: Prepare release v1.0.1"
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin main --tags
```

### Step 2: Build Release Bundle

```bash
cd android
./gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Step 3: Test Before Upload

```bash
# Install APK on test device
adb install android/app/build/outputs/apk/release/app-release.apk

# Test all features
# Check memory usage
# Verify offline functionality
```

### Step 4: Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create developer account ($25 one-time fee)
3. Complete identity verification
4. Add payment method

### Step 5: Create App in Console

1. Click "Create app"
2. Enter app name: "Inheritance Pro"
3. Select category: Utilities
4. Fill out questionnaire

### Step 6: Upload Bundle/APK

1. Go to Release → Production
2. Click "Upload new release"
3. Upload `app-release.aab` (Android App Bundle)
4. Add release notes

### Step 7: Complete Store Listing

1. **App details**:
   - Title: Inheritance Pro
   - Full description: [See above]
   - Short description

2. **Graphics**:
   - Upload icon (512x512)
   - Upload 2+ screenshots
   - Upload feature graphic

3. **Pricing**:
   - Free or Paid
   - Countries/regions

4. **Content rating**:
   - Complete questionnaire
   - Get rating

5. **Privacy policy**:
   - Add URL

## ✅ Pre-Launch Checklist

- [ ] Screenshots captured and formatted
- [ ] Icon created and sized correctly
- [ ] Description written in English
- [ ] Privacy policy created
- [ ] Release notes prepared
- [ ] Version code incremented
- [ ] Build successfully compiled
- [ ] Bundle/APK tested on device
- [ ] All permissions justified
- [ ] Content rating completed
- [ ] Support email configured

## 🎯 Marketing & Distribution

### Recommended Optimizations

1. **App Store Optimization (ASO)**:
   - Keywords: inheritance calculator, fiqh, islamic, wills
   - Description highlights: 4 schools, offline, accurate

2. **Testing**:
   - Run Beta test with 50-100 users first
   - Gather feedback for improvements
   - Fix bugs before launching publicly

3. **Launch Strategy**:
   - Start with Beta release
   - Monitor ratings and reviews
   - Respond to user feedback
   - Plan updates regularly (monthly)

## 📈 Future Improvements

- [ ] Localization (English, Urdu, Farsi)
- [ ] Export to PDF functionality
- [ ] In-app help/tutorials
- [ ] Multiple inheritance scenarios
- [ ] Inheritance templates
- [ ] Dark mode optimization
- [ ] Offline data packs
- [ ] User accounts/sync

## 📞 Support

- GitHub Issues: https://github.com/MohammedAlmaqan/inheritance-pro-v5/issues
- Email: [your-email@example.com]
- Website: [your-website.com]

## 📚 Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Bundle Upload Guide](https://developer.android.com/guide/app-bundle)
- [Gradle Signing](https://developer.android.com/studio/publish/app-signing)
- [Play Store Requirements](https://play.google.com/about/pingassertion/)

---

**Last Updated**: February 6, 2026
**Status**: Ready for Play Store Release
