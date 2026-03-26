#!/bin/bash
# Download uv binary for bundling with Tauri
# Usage: ./download-uv.sh <target-triple>
# Examples:
#   ./download-uv.sh aarch64-apple-darwin
#   ./download-uv.sh x86_64-unknown-linux-gnu

set -e

# Check if target triple is provided
if [ -z "$1" ]; then
    echo "Error: Target triple not provided"
    echo "Usage: $0 <target-triple>"
    echo "Supported targets:"
    echo "  - aarch64-apple-darwin (macOS Apple Silicon)"
    echo "  - x86_64-unknown-linux-gnu (Linux x64)"
    exit 1
fi

TARGET_TRIPLE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION_FILE="$PROJECT_ROOT/src-tauri/uv-version.txt"
BINARIES_DIR="$PROJECT_ROOT/src-tauri/binaries"

# Read uv version from version file
if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: Version file not found: $VERSION_FILE"
    exit 1
fi

UV_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
echo "Downloading uv version $UV_VERSION for $TARGET_TRIPLE"

# Create binaries directory
mkdir -p "$BINARIES_DIR"

# Determine the download URL based on target triple
case "$TARGET_TRIPLE" in
    aarch64-apple-darwin)
        UV_ARCH_FILENAME="uv-aarch64-apple-darwin"
        UV_FILENAME="uv-aarch64-apple-darwin"
        ;;
    x86_64-unknown-linux-gnu)
        UV_ARCH_FILENAME="uv-x86_64-unknown-linux-gnu"
        UV_FILENAME="uv-x86_64-unknown-linux-gnu"
        ;;
    *)
        echo "Error: Unsupported target triple: $TARGET_TRIPLE"
        echo "Supported targets: aarch64-apple-darwin, x86_64-unknown-linux-gnu"
        exit 1
        ;;
esac

DOWNLOAD_URL="https://github.com/astral-sh/uv/releases/download/$UV_VERSION/$UV_ARCH_FILENAME.tar.gz"
ARCHIVE_PATH="/tmp/$UV_ARCH_FILENAME.tar.gz"
DEST_PATH="$BINARIES_DIR/$UV_FILENAME"

echo "Downloading from: $DOWNLOAD_URL"
echo "Saving to: $DEST_PATH"

# Download the archive
curl -L -f -o "$ARCHIVE_PATH" "$DOWNLOAD_URL"

# Extract the archive
echo "Extracting archive..."
TEMP_DIR="/tmp/uv-extract-$UV_VERSION"
mkdir -p "$TEMP_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$TEMP_DIR"

# Find and move the uv binary
EXTRACTED_BINARY=$(find "$TEMP_DIR" -type f -name "uv" | head -n 1)
if [ -z "$EXTRACTED_BINARY" ]; then
    echo "Error: Could not find uv binary in extracted archive"
    exit 1
fi

echo "Moving binary from: $EXTRACTED_BINARY"
mv "$EXTRACTED_BINARY" "$DEST_PATH"

# Cleanup
rm -rf "$TEMP_DIR"
rm -f "$ARCHIVE_PATH"

# Make the file executable
chmod +x "$DEST_PATH"

echo "Successfully downloaded $UV_FILENAME to $DEST_PATH"
echo "Done!"
