// === Настройки OpenStreetMap и прокси ===
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAX_CONCURRENT_REQUESTS = 5;
const PLACEHOLDER_IMAGE = 'assets/no_preview_available.png';

const map = L.map('map').setView([20, 0], 2);
L.tileLayer(TILE_URL, { maxZoom: 18, attribution: ATTRIBUTION }).addTo(map);

const markers = L.markerClusterGroup();
const requestQueue = [];
let activeRequests = 0;

const requestLimiter = (func) => new Promise((resolve) => {
  requestQueue.push(() => func().then(resolve));
  processQueue();
});

function processQueue() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    activeRequests++;
    const nextRequest = requestQueue.shift();
    nextRequest().finally(() => {
      activeRequests--;
      processQueue();
    });
  }
}

const getLocation = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || "Unknown Location";
    }
  } catch (error) {
    console.error("Location error:", error);
  }
  return "Unknown Location";
};

const getProxyUrl = (originalUrl) => `http://localhost:4000/proxy?url=${encodeURIComponent(originalUrl)}`;

fetch('./geojson/photos.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const { image, country_code, year, month, day, fullname, description } = feature.properties;
        const [lon, lat] = feature.geometry.coordinates;

        layer.setLatLng([lat, lon]);

        layer.on('click', async () => {
          const locationName = await requestLimiter(() => getLocation(lat, lon));
          const flagUrl = `https://flagsapi.com/${country_code}/flat/16.png`;
          const proxyImageUrl = getProxyUrl(image);
          const shortDesc = description ? description.split(" ").slice(0, 5).join(" ") + '...' : '';

            const popupContent = `
              <div style="text-align: center; padding: 10px;">
                <img src="${flagUrl}" width="16" height="16" style="margin-right: 5px;">
                <strong>${locationName}</strong><br>
                📅 ${day}.${month}.${year}<br>
                <img src="${proxyImageUrl}" class="popup-image" style="width: 200px; height: auto; margin: 10px 0;" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                ${description ? `<p style="font-size: 12px;">${shortDesc} <a href="#" class="more-link" data-full="${encodeURIComponent(description)}" data-img="${getProxyUrl(fullname)}">ещё</a></p>` : ""}
                <a href="${fullname}" target="_blank">🔗 Open Full Image</a>
              </div>`;
            
          layer.bindPopup(popupContent).openPopup();
        });

        markers.addLayer(layer);
      }
    });

    map.addLayer(markers);
  });

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  const modalImg = document.getElementById("modal-image");
  const closeBtn = document.getElementById("modal-close");

  // — закрытие по кнопке ✖
  closeBtn.onclick = () => (modal.style.display = "none");

  // — закрытие по клику вне модалки
  window.addEventListener("click", (e) => {
    if (e.target.id === "modal") {
      modal.style.display = "none";
    }
  });

  // === ✅ Делегированный обработчик ссылки "ещё"
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("more-link")) {
      e.preventDefault();
      const desc = decodeURIComponent(e.target.dataset.full || "");
      const img = e.target.dataset.img || "";
      showFullDescription(desc, img);
    }
  });
});