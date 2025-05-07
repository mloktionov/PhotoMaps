#!/bin/bash

FOLDER="images"  # путь к папке, можешь изменить

echo "📂 Проверяем папку: $FOLDER"

JPEG_COUNT=$(find "$FOLDER" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | wc -l)
JSON_COUNT=$(find "$FOLDER" -type f -iname "*.json" | wc -l)

echo "🖼️ JPEG/JPEG: $JPEG_COUNT"
echo "📄 JSON-файлов: $JSON_COUNT"