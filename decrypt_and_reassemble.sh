#!/bin/bash
# Base name of the file to reconstruct
FILE_BASE="$1"

# Define the directory where reassembled files will be stored
REASSEMBLED_DIR="./reassembled"

# Create the directory if it does not exist
if [ ! -d "$REASSEMBLED_DIR" ]; then
    mkdir -p "$REASSEMBLED_DIR"
fi

# Define the output file name with path to the reassembled directory
OUTPUT_FILE="${REASSEMBLED_DIR}/${FILE_BASE}_reconstructed"

# Directory where chunks are stored
CHUNKS_DIR="./chunks"

# Check if the chunks directory exists
if [ ! -d "$CHUNKS_DIR" ]; then
    echo "Chunks directory does not exist."
    exit 1
fi

# Reassemble the file from the chunks
cat "${CHUNKS_DIR}"/"$(basename "$FILE_BASE")"_chunk* > "$OUTPUT_FILE"

# Echo the completion of operation
echo "Reconstructed file: $OUTPUT_FILE"
