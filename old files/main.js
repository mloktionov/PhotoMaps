const CSV_PATH = "csv/photos.csv";
const THUMBNAIL_PATH = "thumbnails/";
const IMAGE_PATH = "photos/";
const ICON_SIZE = [32, 32];
const POPUP_IMG_WIDTH = 280;

let map = L.map("map").setView([51.5, 19.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

let allMarkers = [];

// === 📷 Загрузка точек с координатами ===
async function loadMainPhotos() {
  const response = await fetch(CSV_PATH);
  const csv = await response.text();
  const data = Papa.parse(csv, { header: true }).data;

  data.forEach(row => {
    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    const fname = row.filename;
    const year = row.year;
    const month = String(row.month).padStart(2, "0");
    const day = String(row.day).padStart(2, "0");

    const thumbName = fname.replace(/\.jpe?g$/i, ".png");
    const icon = L.icon({
      iconUrl: `${THUMBNAIL_PATH}${thumbName}`,
      iconSize: ICON_SIZE,
      className: "preview-icon"
    });

    const marker = L.marker([lat, lon], { icon });
    marker.bindPopup(`
      <div class="popup-box">
        <img src="${IMAGE_PATH}${fname}" class="popup-img" width="${POPUP_IMG_WIDTH}" />
        <div class="popup-caption">${month}-${day}</div>
      </div>
    `, {
      autoPan: true,
      autoPanPadding: [30, 30]
    });

    marker.addTo(map);
    allMarkers.push(marker);
  });
}

// === 🚀 Инициализация ===
async function initMap() {
  await loadMainPhotos();
}

initMap();