#!/bin/bash
# If the chunks directory is relative to the script's location
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CHUNKS_DIR="$DIR/chunks"

FILE="$1"
CHUNK_SIZE=$((7*1024*1024)) # 7 MB in bytes

echo "Splitting file: $FILE into 7 MB chunks..."
split -b $CHUNK_SIZE "$FILE" "${CHUNKS_DIR}/$(basename "$FILE")_chunk"
