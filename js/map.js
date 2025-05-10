/* === Инициализация карты === */
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
let allLayers = [];
const years = new Set();

const yearSelect = document.getElementById('yearFilter');
const monthSelect = document.getElementById('monthFilter');
const pointCount = document.getElementById('pointCount');

/* === Загрузка GeoJSON данных === */
fetch('./geojson/photos.geojson')
    .then(response => response.json())
    .then(data => {
        console.log("Loaded GeoJSON data:", data);
        L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                const { filename, year, month, image } = feature.properties;

                console.log("Исходная ссылка на изображение:", image);

                const popupContent = `
                    <div>
                        <strong>${filename}</strong><br>
                        Year: ${year}<br>
                        Month: ${month}<br>
                        <img data-src="${image}" class="popup-image lazyload" style="width: 100px; height: auto;" alt="Preview">
                    </div>
                `;

                layer.bindPopup(popupContent);
                markers.addLayer(layer);
                allLayers.push(layer);
                years.add(String(year));

                // === Lazy Load обработка ===
                layer.on('popupopen', () => {
                    const img = layer.getPopup().getElement().querySelector('img');
                    if (img && !img.src) {
                        img.src = img.dataset.src;
                        console.log("Lazy load image src set to:", img.src);
                    }
                });
            }
        });

        map.addLayer(markers);
        pointCount.textContent = `Total Points: ${allLayers.length}`;

        // === Заполнение селектора годов ===
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        });
    });


/* === Обновление фильтрации === */
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

    pointCount.textContent = `Total Points: ${visibleCount}`;
}

/* === Сброс фильтров === */
function resetFilters() {
    yearSelect.value = 'all';
    monthSelect.value = 'all';
    applyFilter();
}

/* === События изменения фильтров === */
yearSelect.addEventListener('change', applyFilter);
monthSelect.addEventListener('change', applyFilter);
