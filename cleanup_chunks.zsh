#!/bin/zsh

# Deletes files older than a specified number of days in the chunks directory
cleanup_old_chunks() {
    local chunks_dir=$1
    local days_old=$2
    find "$chunks_dir" -type f -mtime +"$days_old" -exec rm {} +
}

# Usage: ./cleanup_chunks.zsh path_to_chunks_dir days_old
if [[ -z "$1" || -z "$2" ]]; then
    echo "Usage: $0 path_to_chunks_dir days_old"
    exit 1
fi

cleanup_old_chunks "$1" "$2"
