// === main.js ===

const CSV_PATH = "csv/photos.csv";
const THUMBNAIL_PATH = "thumbnails/";
const ICON_SIZE = [32, 32];
const POPUP_IMG_WIDTH = 280;

const yearColors = {
  "2000": "#777777", "2001": "#8e44ad", "2002": "#2980b9", "2003": "#27ae60",
  "2004": "#f39c12", "2005": "#e74c3c", "2006": "#d35400", "2007": "#1abc9c",
  "2008": "#2c3e50", "2009": "#7f8c8d", "2010": "#9b59b6", "2011": "#3498db",
  "2012": "#16a085", "2013": "#f1c40f", "2014": "#e67e22", "2015": "#e84393",
  "2016": "#6c5ce7", "2017": "#00cec9", "2018": "#fab1a0", "2019": "#81ecec",
  "2020": "#ffeaa7", "2021": "#55efc4", "2022": "#74b9ff", "2023": "#a29bfe",
  "2024": "#fd79a8", "2025": "#636e72"
};

let map, currentYear = null;
let allMarkers = [];

async function initMap() {
  map = L.map("map").setView([51.5, 19.0], 6);
  applyTileLayer();

  const response = await fetch(CSV_PATH);
  const csv = await response.text();
  const data = Papa.parse(csv, { header: true }).data;

  data.forEach(row => {
    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);
    const fname = row.filename;
    const year = row.year;
    const month = String(row.month).padStart(2, "0");
    const day = String(row.day).padStart(2, "0");

    if (isNaN(lat) || isNaN(lon)) return;

    const icon = L.icon({
      iconUrl: `${THUMBNAIL_PATH}${fname}`,
      iconSize: ICON_SIZE,
      className: "preview-icon"
    });

    const marker = L.marker([lat, lon], { icon });
    marker.options.photoYear = year;
    marker.options.photoDate = `${month}-${day}`;

    const imgPath = `images/${fname}`;
    const popupHTML = `
      <div class="popup-box">
        <img src="${imgPath}" class="popup-img" />
        <div class="popup-caption">${month}-${day}</div>
      </div>`;

    marker.bindPopup(popupHTML, {
      autoPan: true,
      autoPanPadding: [30, 30]
    });

    marker.addTo(map);
    allMarkers.push(marker);
  });

  createYearFilter(data);

  document.getElementById("caption-search").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    filterByCaption(query);
  });
}

function createYearFilter(data) {
  const container = document.getElementById("year-filter");
  const years = [...new Set(data.map(d => d.year))].sort();

  const allBtn = document.createElement("div");
  allBtn.textContent = "Все";
  allBtn.classList.add("year-button", "active");
  container.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    currentYear = null;
    updateMarkers();
    updateButtons();
  });

  years.forEach(year => {
    const btn = document.createElement("div");
    btn.textContent = year;
    btn.classList.add("year-button");
    btn.style.backgroundColor = yearColors[year] || "#999";
    container.appendChild(btn);

    btn.addEventListener("click", () => {
      currentYear = year;
      updateMarkers();
      updateButtons();
    });
  });

  function updateMarkers() {
    allMarkers.forEach(marker => {
      const match = currentYear === null || marker.options.photoYear === currentYear;
      if (match) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  }

  function updateButtons() {
    const buttons = container.querySelectorAll(".year-button");
    buttons.forEach(b => b.classList.remove("active"));
    if (currentYear === null) {
      allBtn.classList.add("active");
    } else {
      const target = [...buttons].find(b => b.textContent === currentYear);
      if (target) target.classList.add("active");
    }
  }
}

function filterByCaption(query) {
  const normQuery = query.toLowerCase();

  allMarkers.forEach(marker => {
    const date = marker.options.photoDate || "";
    const isMatch = date.startsWith(normQuery);
    if (isMatch) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}

function applyTileLayer() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

initMap();