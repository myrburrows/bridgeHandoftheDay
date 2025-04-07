#!/bin/bash

# Check if a file argument is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <text_file>"
  exit 1
fi

# Assign the input file to a variable and convert to absolute path
input_file=$(realpath "$1" 2>/dev/null || readlink -f "$1" 2>/dev/null || echo "$(pwd)/$1")

# Check if the file exists
if [ ! -f "$input_file" ]; then
  echo "Error: File '$input_file' not found."
  exit 1
fi

# Create a temporary file
temp_file=$(mktemp)

# Use sed to add <span class="red"> tags around ♥ or ♦ and the next character
# - ♥ or ♦ is matched with [♥♦]
# - . matches the next single character
# - The replacement wraps them in the span tag
sed 's/[♥♦]\(.\)/<span class="red">&<\/span>/g' "$input_file" > "$temp_file"

# Overwrite the original file with the modified content
mv "$temp_file" "$input_file"

echo "Updated '$input_file' with red tags for ♥ and ♦ suits."