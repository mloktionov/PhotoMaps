// === Настройки ===
const FLAG_URL_TEMPLATE = "https://flagsapi.com/{code}/flat/16.png";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse?format=json";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

// === Инициализация карты ===
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
let allLayers = [];

// === Загрузка GeoJSON данных ===
fetch('./geojson/photos.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            onEachFeature: async (feature, layer) => {
                const { filename, image, country_code, year, month, day } = feature.properties;

                // === Проверка координат ===
                let latitude = feature.geometry.coordinates[1];
                let longitude = feature.geometry.coordinates[0];

                if (!latitude || !longitude) {
                    console.error(`❌ Не найдены координаты для: ${filename}`);
                    latitude = "0";
                    longitude = "0";
                }

                // === Подгрузка изображения при клике ===
                layer.on('click', async () => {
                    console.log(`📌 Попап открыт для: ${filename}`);
                    
                    // === Загрузка превью изображения ===
                    const imgUrl = image ? image : PLACEHOLDER_IMAGE;

                    // === Получение локации через Nominatim ===
                    let locationName = "Unknown Location";
                    try {
                        const response = await fetch(`${NOMINATIM_URL}&lat=${latitude}&lon=${longitude}`);
                        if (response.ok) {
                            const result = await response.json();
                            locationName = result.address.city ?? result.address.town ?? result.address.village ?? "Unknown Location";
                        } else {
                            console.error("❌ Ошибка загрузки локации.");
                        }
                    } catch (error) {
                        console.error("⚠️ Ошибка сети при загрузке локации:", error);
                    }

                    // === Флаг страны ===
                    const flagUrl = country_code ? FLAG_URL_TEMPLATE.replace("{code}", country_code) : PLACEHOLDER_IMAGE;

                    // === Контент для попапа ===
                    const popupContent = `
                        <div style="text-align: center; padding: 10px;">
                            <strong style="font-size: 14px;">${locationName}</strong>
                            <div style="margin-top: 5px;">
                                <img src="${flagUrl}" style="vertical-align: middle; margin-right: 5px;" width="16" height="16"> |
                                <img src="https://img.icons8.com/color/16/000000/calendar-16.png" style="vertical-align: middle; margin-right: 5px;">${day} |
                                <img src="https://img.icons8.com/color/16/000000/calendar-16.png" style="vertical-align: middle; margin-right: 5px;">${month} |
                                <img src="https://img.icons8.com/color/16/000000/calendar--v1.png" style="vertical-align: middle; margin-right: 5px;">${year}
                            </div>
                            <img src="${imgUrl}" style="width: 200px; height: auto; display: block; margin: 10px auto; border-radius: 8px; border: 1px solid #ccc;">
                        </div>
                    `;

                    layer.bindPopup(popupContent).openPopup();
                });

                markers.addLayer(layer);
                allLayers.push(layer);
            }
        });

        map.addLayer(markers);
    })
    .catch(error => {
        console.error("Ошибка при загрузке GeoJSON данных:", error);
    });