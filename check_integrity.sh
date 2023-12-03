#!/bin/bash

# Calculate and print MD5 checksum of a file
calculate_checksum() {
    local file_path=$1
    md5sum "$file_path" | awk '{ print $1 }'
}

# Usage: ./check_integrity.sh path_to_file
if [ -z "$1" ]; then
    echo "Usage: $0 path_to_file"
    exit 1
fi

checksum=$(calculate_checksum "$1")
echo "MD5 Checksum: $checksum"
