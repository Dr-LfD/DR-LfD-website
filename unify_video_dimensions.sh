#!/bin/bash

# Script to unify the dimensions of libero_dmg videos
# Target resolution: 1274x796 (maximum dimensions found)

set -euo pipefail  # 增强错误检测：退出错误、未定义变量报错、管道中任意命令失败则整体失败

# Base directory
BASE_DIR="public/libero_dmg"
BACKUP_DIR="${BASE_DIR}/backup_$(date +%Y%m%d_%H%M%S)"

# Target dimensions (maximum width and height from all videos)
TARGET_WIDTH=1274
TARGET_HEIGHT=796

# List of videos to process
VIDEOS=(
    "spatial1.mp4"
    "obj1.mp4"
    "living_retry.mp4"
    "kitchen_compressed.mp4"
    "study_compressed.mp4"
)

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it first."
    exit 1
fi

# Check if ffprobe is installed (ffmpeg通常自带，但显式检查更稳妥)
if ! command -v ffprobe &> /dev/null; then
    echo "Error: ffprobe is not installed (usually comes with ffmpeg)."
    exit 1
fi

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Process each video
for video in "${VIDEOS[@]}"; do
    input_file="${BASE_DIR}/${video}"
    
    if [ ! -f "$input_file" ]; then
        echo "Warning: $input_file not found, skipping..."
        continue
    fi
    
    echo ""
    echo "Processing: $video"
    
    # Get current dimensions (修正错误输出重定向的位置，确保稳定获取)
    current_dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$input_file")
    echo "  Current dimensions: $current_dims"
    
    # Backup original
    echo "  Backing up to: ${BACKUP_DIR}/${video}"
    cp "$input_file" "${BACKUP_DIR}/${video}" || { echo "Error: Failed to backup $input_file"; exit 1; }
    
    # Create temporary output file
    temp_output="${input_file}.tmp"
    # 提前删除可能存在的旧临时文件，避免干扰
    rm -f "$temp_output"
    
    # Resize video: scale to fit target dimensions while maintaining aspect ratio
    # This will add black bars (letterboxing/pillarboxing) if needed
    echo "  Resizing to ${TARGET_WIDTH}x${TARGET_HEIGHT}... (This may take a few moments)"
    # 执行ffmpeg并记录其退出码（关键：单独保存ffmpeg的退出码）
    # 替换为重新编码音频，避免复制音频流的兼容问题
    ffmpeg -i "$input_file" \
        -vf "scale=w=${TARGET_WIDTH}:h=${TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=w=${TARGET_WIDTH}:h=${TARGET_HEIGHT}:x=(ow-iw)/2:y=(oh-ih)/2:color=black" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -f mp4 \
        -y \
        "$temp_output" > ffmpeg_log.txt 2>&1
    ffmpeg_exit_code=$?  # 保存ffmpeg的退出码
    
    # 显示ffmpeg的关键日志信息
    echo "  FFmpeg key info:"
    grep -E "(Duration|Stream|frame|size)" ffmpeg_log.txt || true
    rm -f ffmpeg_log.txt  # 清理日志文件
    
    # 检查ffmpeg是否执行成功
    if [ $ffmpeg_exit_code -ne 0 ] || [ ! -f "$temp_output" ]; then
        echo "Error: ffmpeg failed to process $input_file (exit code: $ffmpeg_exit_code)"
        # 恢复备份文件
        cp "${BACKUP_DIR}/${video}" "$input_file" || { echo "Error: Failed to restore backup for $input_file"; exit 1; }
        exit 1
    fi
    
    # Replace original with resized version
    mv "$temp_output" "$input_file" || { echo "Error: Failed to replace $input_file with $temp_output"; exit 1; }
    
    # Verify new dimensions
    new_dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$input_file")
    echo "  New dimensions: $new_dims"
    echo "  ✓ Completed: $video"
done

echo ""
echo "=========================================="
echo "All videos have been processed!"
echo "Original files backed up to: $BACKUP_DIR"
echo "All videos now have dimensions: ${TARGET_WIDTH}x${TARGET_HEIGHT}"
echo "=========================================="