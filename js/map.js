""// === Инициализация карты ===
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

// === 🚀 Загрузка GeoJSON данных ===
fetch('./geojson/photos.geojson')
    .then(response => response.json())
    .then(data => {
        const years = new Set();

        L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                const googleThumbnailLink = `https://drive.google.com/thumbnail?id=${feature.properties.image.split("id=")[1]}`;
                const popupContent = `
                    <div>
                        <strong>${feature.properties.filename}</strong><br>
                        📅 Year: ${feature.properties.year}<br>
                        📆 Month: ${feature.properties.month}<br>
                        <img src="${googleThumbnailLink}" class="popup-image" alt="Image Preview" style="max-width: 250px; border-radius: 5px; margin-top: 5px;">
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

        // === 📌 Заполнение селектора годов ===
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Ошибка загрузки GeoJSON:', error));

// === 🔄 Функция фильтрации ===
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

// === 🔄 Сброс фильтров ===
function resetFilters() {
    yearSelect.value = 'all';
    monthSelect.value = 'all';
    applyFilter();
}

// === 🎯 События изменения фильтров ===
yearSelect.addEventListener('change', applyFilter);
monthSelect.addEventListener('change', applyFilter);
""
