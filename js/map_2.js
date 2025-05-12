// === Настройки для OpenStreetMap ===
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAX_CONCURRENT_REQUESTS = 5;

// === Границы Китая для пересчета ===
const isInChina = (lat, lon) => {
    return lon >= 73.66 && lon <= 135.05 && lat >= 18.1 && lat <= 53.55;
};

// === Пересчет координат для Китая ===
const transformCoordinates = (lat, lon, countryCode) => {
    if (countryCode === 'CN' && isInChina(lat, lon)) {
        const deltaLat = 0.0022; // Сдвиг на север
        const deltaLon = -0.0045; // Сдвиг на запад
        return [lat + deltaLat, lon + deltaLon];
    }
    return [lat, lon];
};

// === Инициализация карты ===
const map = L.map('map').setView([20, 0], 2);
L.tileLayer(TILE_URL, {
    maxZoom: 18,
    attribution: ATTRIBUTION
}).addTo(map);

const markers = L.markerClusterGroup();
const requestQueue = [];
let activeRequests = 0;

// === Ограничитель параллельных запросов ===
const requestLimiter = (func) => {
    return new Promise((resolve) => {
        requestQueue.push(() => func().then(resolve));
        processQueue();
    });
};

const processQueue = () => {
    while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
        activeRequests++;
        const nextRequest = requestQueue.shift();
        nextRequest().finally(() => {
            activeRequests--;
            processQueue();
        });
    }
};

// === Функция получения локации ===
const getLocation = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.address.city || data.address.town || data.address.village || "Unknown Location";
        } else {
            console.error("Ошибка при получении данных локации:", response.status);
            return "Unknown Location";
        }
    } catch (error) {
        console.error("Ошибка сети при получении данных локации:", error);
        return "Unknown Location";
    }
};

// === Загрузка GeoJSON данных ===
fetch('./geojson/photos.geojson')
    .then((response) => response.json())
    .then((data) => {
        L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                const { image, country_code, year, month, day } = feature.properties;

                // Применяем пересчет координат ТОЛЬКО для Китая
                let [lat, lon] = transformCoordinates(
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0],
                    country_code
                );

                layer.setLatLng([lat, lon]);

                // При клике на маркер
                layer.on('click', async () => {
                    const locationName = await requestLimiter(() => getLocation(lat, lon));
                    const flagUrl = `https://flagsapi.com/${country_code}/flat/16.png`;
                    const popupContent = `
                        <div style="text-align: center; padding: 10px;">
                            <img src="${flagUrl}" style="vertical-align: middle; margin-right: 5px;" width="16" height="16">
                            <strong>${locationName}</strong><br>
                            <img src="https://img.icons8.com/color/16/000000/calendar-16.png" 
                                style="vertical-align: middle; margin-right: 5px;"> ${day} |
                            <img src="https://img.icons8.com/color/16/000000/calendar-16.png" 
                                style="vertical-align: middle; margin-right: 5px;"> ${month} |
                            <img src="https://img.icons8.com/color/16/000000/calendar--v1.png" 
                                style="vertical-align: middle; margin-right: 5px;"> ${year} 
                            <img src="${image}" class="popup-image" style="width: 200px; height: auto; margin: 10px 0;">
                        </div>
                    `;
                    layer.bindPopup(popupContent).openPopup();
                });

                markers.addLayer(layer);
            }
        });

        map.addLayer(markers);
    })
    .catch((error) => {
        console.error("Ошибка загрузки GeoJSON:", error);
    });