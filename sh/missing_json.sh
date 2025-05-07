#!/bin/bash

FOLDER="images"

echo "🔍 Ищем изображения без соответствующего JSON..."

find "$FOLDER" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r img; do
  json1="${img}.supplemental-metadata.json"
  json2="${img}.supplemental-meta.json"

  if [[ ! -f "$json1" && ! -f "$json2" ]]; then
    echo "$(basename "$img")"
  fi
done