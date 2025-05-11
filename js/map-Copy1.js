// === Инициализация карты ===
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
let allLayers = [];

const yearSelect = document.getElementById('yearFilter');
const monthSelect = document.getElementById('monthFilter');
const pointCount = document.getElementById('pointCount');

// === Загрузка GeoJSON данных ===
fetch('./geojson/photos.geojson')
    .then(response => response.json())
    .then(data => {
        const years = new Set();

        L.geoJSON(data, {
            onEachFeature: async (feature, layer) => {
                const { filename, year, month, day, image, country_code } = feature.properties;

                // URL для превью
                console.log("🌐 Попытка загрузить превью:", image);

                try {
                    const response = await fetch(image, { method: 'GET', mode: 'no-cors' });

                    if (response.ok) {
                        console.log("✅ Успешно загружено превью:", image);
                    } else {
                        console.error(`❌ Ошибка загрузки изображения (${response.status}): ${image}`);
                        if (response.status === 403) {
                            console.error("⛔ Доступ к изображению запрещен (403). Возможно, проблемы с доступом или лимитом.");
                        } else if (response.status === 404) {
                            console.error("🔎 Изображение не найдено (404).");
                        } else {
                            console.error("⚠️ Неизвестная ошибка при загрузке изображения.");
                        }
                    }
                } catch (error) {
                    console.error(`❌ Ошибка при загрузке изображения: ${error.message}`);
                    if (error.message.includes("Failed to fetch")) {
                        console.error("🌐 Возможно, проблема с CORS или сетью.");
                    }
                }

                // Структура попапа
                const popupContent = `
                    <div style="text-align: center; padding: 10px;">
                        <span style="font-size: 12px; color: #555;">
                            <img src="https://flagsapi.com/${country_code}/flat/16.png" 
                                 style="vertical-align: middle; margin-right: 5px;" width="16" height="16">
                            <img src="https://img.icons8.com/color/16/000000/calendar-16.png" 
                                 style="vertical-align: middle; margin-right: 5px;">${day} | 
                            <img src="https://img.icons8.com/color/16/000000/calendar-16.png" 
                                 style="vertical-align: middle; margin-right: 5px;">${month} | 
                            <img src="https://img.icons8.com/color/16/000000/calendar--v1.png" 
                                 style="vertical-align: middle; margin-right: 5px;">${year}
                        </span><br>
                        <img src="${image}" 
                             class="popup-image" 
                             style="width: 200px; height: auto; display: block; margin: 10px auto; border-radius: 8px; border: 1px solid #ccc;" 
                             alt="Preview">
                    </div>
                `;

                layer.bindPopup(popupContent);
                markers.addLayer(layer);
                allLayers.push(layer);
                years.add(String(feature.properties.year));
            }
        });

        map.addLayer(markers);
        pointCount.textContent = allLayers.length;

        // Заполнение селектора годов
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        });
    });

// === Функция фильтрации ===
function applyFilter() {
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;
    markers.clearLayers();
    let visibleCount = 0;

    allLayers.forEach(layer => {
        const { year, month } = layer.feature.properties;
        if (
            (selectedYear === 'all' || String(year) === selectedYear) &&
            (selectedMonth === 'all' || String(month).padStart(2, '0') === selectedMonth)
        ) {
            markers.addLayer(layer);
            visibleCount++;
        }
    });

    pointCount.textContent = visibleCount;
}

// === Сброс фильтров ===
function resetFilters() {
    yearSelect.value = 'all';
    monthSelect.value = 'all';
    applyFilter();
}

// === События изменения фильтров ===
yearSelect.addEventListener('change', applyFilter);
monthSelect.addEventListener('change', applyFilter);