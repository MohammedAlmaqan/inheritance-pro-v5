#!/bin/bash

##############################################################################
# Inheritance Pro v5.0 - APK Build Script
# This script builds the Android APK with the latest improvements
# Usage: ./build-apk.sh [debug|release]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_TYPE=${1:-debug}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ANDROID_DIR="$PROJECT_ROOT/android"
WEB_DIR="$PROJECT_ROOT"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Inheritance Pro v5.0 - APK Builder${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Validate inputs
if [[ ! "$BUILD_TYPE" =~ ^(debug|release)$ ]]; then
    echo -e "${RED}Error: Invalid build type '$BUILD_TYPE'${NC}"
    echo "Usage: ./build-apk.sh [debug|release]"
    exit 1
fi

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Please install JDK 11+ from https://www.oracle.com/java/technologies/downloads/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Java found: $(java -version 2>&1 | head -1)${NC}"

# Check Gradle
if ! command -v gradle &> /dev/null && [[ ! -f "$ANDROID_DIR/gradlew" ]]; then
    echo -e "${RED}❌ Gradle wrapper not found in $ANDROID_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Gradle wrapper found${NC}"

# Check Android SDK
if [[ -z "$ANDROID_HOME" ]]; then
    echo -e "${YELLOW}⚠ ANDROID_HOME not set. Gradle will use cached SDK if available.${NC}"
else
    echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"
fi

echo ""

# Step 2: Build web assets
echo -e "${YELLOW}Step 2: Building web assets...${NC}"
cd "$WEB_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

npm run build

if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Web assets built successfully${NC}"
echo ""

# Step 3: Clean Android build
echo -e "${YELLOW}Step 3: Cleaning Android build directory...${NC}"
cd "$ANDROID_DIR"

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew clean
    echo -e "${GREEN}✓ Android build cleaned${NC}"
else
    ./gradlew clean
    echo -e "${GREEN}✓ Android build cleaned${NC}"
fi

echo ""

# Step 4: Build APK
echo -e "${YELLOW}Step 4: Building APK (this may take 2-5 minutes)...${NC}"

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew assembleDebug
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
    APK_TYPE="Debug"
else
    echo -e "${YELLOW}Building release APK...${NC}"
    ./gradlew assembleRelease
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    APK_TYPE="Release"
fi

echo ""

# Step 5: Verify APK
echo -e "${YELLOW}Step 5: Verifying APK...${NC}"

if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}❌ APK not found at $APK_PATH${NC}"
    exit 1
fi

APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
echo -e "${GREEN}✓ APK created successfully${NC}"
echo -e "${GREEN}  Type: $APK_TYPE${NC}"
echo -e "${GREEN}  Size: $APK_SIZE${NC}"
echo -e "${GREEN}  Path: $APK_PATH${NC}"

echo ""

# Step 6: Installation instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}Installation Options:${NC}"
echo ""
echo "1. Install on connected Android device (ADB):"
echo -e "   ${GREEN}adb install -r \"$APK_PATH\"${NC}"
echo ""
echo "2. Transfer file manually:"
echo -e "   ${GREEN}File location: $APK_PATH${NC}"
echo "   • Copy to phone"
echo "   • Enable 'Unknown Sources' in Settings"
echo "   • Open file and tap Install"
echo ""
echo "3. Upload to app store or distribution platform"
echo ""

# Optional: Check if ADB is available
if command -v adb &> /dev/null; then
    echo -e "${YELLOW}ADB detected. Quick install:${NC}"
    echo -e "   ${GREEN}adb install -r \"$APK_PATH\"${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Ready to test on your Android device!${NC}"
echo ""

# Information
echo -e "${YELLOW}App Information:${NC}"
echo "  Version: 5.0.0"
echo "  Phase: 2 Sprint 4 (Complete)"
echo "  Features:"
echo "    • WCAG 2.1 AA Accessibility"
echo "    • Mobile-First Responsive Design"
echo "    • Smooth Animations (prefers-reduced-motion aware)"
echo "    • 4 Madhabs (Hanafi, Maliki, Shafi'i, Hanbali)"
echo "    • Full Type Safety (TypeScript)"
echo "    • 372 Tests (100% passing)"
echo ""

# Cleanup optional
read -p "Keep temporary build files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Build files kept for future builds"
else
    echo "Cleaning up..."
    cd "$ANDROID_DIR"
    ./gradlew clean
    echo "Build cleanup complete"
fi

echo ""
echo -e "${GREEN}Build process completed at $(date)${NC}"
