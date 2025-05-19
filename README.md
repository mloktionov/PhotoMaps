# PhotoMaps
Repo to keep jpgs for Photomaps app

# 🗺️ PhotoMaps: Геометки с миниатюрами

## 📁 Структура проекта

"""
PhotoMaps/
├── csv/                         # CSV-файлы, полученные из пайплайна
│   ├── photos.csv              # Основной датасет с координатами
│   ├── photos_descriptions.csv # Description из Google Photos
│   ├── google_drive_links.csv  # Ссылки на фото в Google Drive
│   └── photos_final.csv        # Финальный объединённый CSV
│
├── geojson/                    # GeoJSON с финальной разметкой на карту
│   └── photos.geojson
│
├── images/                     # Исходные папки с фотографиями
│   └── PhotoMap YYYY-YYYY/     # Подкаталоги по годам
│
├── photos/                     # Сжатые и переименованные JPG-файлы
│   └── IMG_YYYYMMDD_.jpg
│
├── js/
│   ├── map.js                  # Основная логика карты и модального окна
│   └── filters.js              # Фильтры по годам/месяцам
│
├── css/
│   └── styles.css              # Базовые стили и кастомизация Leaflet
│
├── assets/
│   └── no_preview_available.png # Заглушка для недоступных изображений
│
├── index.html                  # Главная страница с картой
├── app.py                      # Прокси-сервер (локальный backend)
├── requirements.txt            # Зависимости Python
└── README.md                   # Документация
"""

⚙️ Генерация производится через Python-ноутбуки в `build_photos.ipynb`.

# Pipeline:
1. Check stats for images folder and included albums
2. Run MAIN script. It will create photos/ folder with photos, encoded from different formats from images/ folder. It will also create photos.csv with census of files and missing_coords.csv with the ones which do not have any coords. Source files (jpg, jpeg, heic) are transformed into jpg files according to the template IMG_YYYYMMDD_has.jpg
3. Run a script to pick up Description field from Google Photos. It uses Album+source_filename to identify photo. It records the results into photos_description.csv
4. Add coordinates to missing_coords.csv manually
5. Run the next script which will merge photos.csv+missing_coords.csv+photos_descriptions.csv into photos_cobmined.csv which contains the full list of all photos with their names, coordinates, dates and description.
6. Upload files from photos/ to Google Drive/photos
7. Connect to Google Drive and get new filenames with their links into google_drive_links.csv
8. Get all info from photos_combined.csv and google_drive_links.csv into photos_final.csv
9. Put all info from photos_final.csv into photos.geojson
10. Get country code from nominate site into photos.geojson

# Roadmap
## 🔍 Навигация и структура
	•	Кластеризация меток на карте
	•	Фильтры по году и месяцу
	•	Цветовая кодировка по времени
	•	Добавление слоёв меток (по авторам/группам)

## 🧠 Интеллект и интеграции
	•	Поддержка описаний из Google Photos
	•	Интеграция с Google Drive для показа фото
	•	Вставка HTML, ссылок и встроенных YouTube в описание
	•	Распознавание координат из description (напр. @lat,lon)
	•	Генерация описаний с помощью GPT (подсказки, стили)

## 🛠️ Инструменты редактирования
	•	Импорт маршрутов (KML, GPX)
	•	Создание собственных маршрутов на карте
	•	Ручное редактирование метки:
	•	координаты
	•	описание
	•	Перемещение точек на карте
	•	Undo / Redo / История изменений

## 🧪 Прочее
	•	Отображение EXIF-информации
	•	Интеграция с OpenStreetCam / Mapillary
	•	Экспорт всей карты в HTML или PDF
