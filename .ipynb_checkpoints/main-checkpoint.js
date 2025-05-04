const CSV_DIR = "csv/";
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

let map, allMarkers = [];

async function initMap() {
  map = L.map("map").setView([51.5, 19.0], 6);
  applyTileLayer();

  const csvFiles = await listCsvFiles();  // 🔄 Получаем все photos_YYYY.csv
  const allData = [];

  for (const file of csvFiles) {
    const resp = await fetch(CSV_DIR + file);
    const text = await resp.text();
    const data = Papa.parse(text, { header: true }).data;
    console.log(`📄 Загружено ${data.length} записей из ${file}`);
    allData.push(...data);
  }

  allData.forEach(row => {
    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);
    const fname = row.filename;
    const year = row.year;
    const month = String(row.month).padStart(2, "0");
    const day = String(row.day).padStart(2, "0");

    if (isNaN(lat) || isNaN(lon)) return;

    const thumbName = fname.replace(/\.jpe?g$/i, ".png");
    const icon = L.icon({
      iconUrl: `${THUMBNAIL_PATH}${thumbName}`,
      iconSize: ICON_SIZE,
      className: "preview-icon"
    });

    const marker = L.marker([lat, lon], { icon });
    marker.options.photoDate = `${year}-${month}-${day}`;
    marker.options.photoYear = year;

    const popupHTML = `
      <div class="popup-box">
        <img src="images/${fname}" class="popup-img" />
        <div class="popup-caption">${month}-${day}</div>
      </div>`;

    marker.bindPopup(popupHTML, {
      autoPan: true,
      autoPanPadding: [30, 30]
    });

    marker.addTo(map);
    allMarkers.push(marker);
  });

//  createYearFilter(allData);
  setupDateSearch();
}

// 🔍 Получить список всех файлов csv/photos_YYYY.csv
async function listCsvFiles() {
  const resp = await fetch(CSV_DIR);
  const html = await resp.text();
  const matches = html.match(/photos_\d{4}\.csv/g);
  const files = matches ? [...new Set(matches)] : [];
  console.log("📂 Загружаем CSV-файлы:", files);
  return files;
}

function createYearFilter(data) {
  const container = document.getElementById("year-filter");
  const years = [...new Set(data.map(d => d.year))].sort();

  const allBtn = document.createElement("div");
  allBtn.textContent = "Все";
  allBtn.classList.add("year-button", "active");
  container.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    updateMarkers();
    updateButtons(null);
  });

  years.forEach(year => {
    const btn = document.createElement("div");
    btn.textContent = year;
    btn.classList.add("year-button");
    btn.style.backgroundColor = yearColors[year] || "#999";
    container.appendChild(btn);

    btn.addEventListener("click", () => {
      updateMarkers(year);
      updateButtons(year);
    });
  });

  function updateMarkers(selectedYear = null) {
    allMarkers.forEach(marker => {
      const show = !selectedYear || marker.options.photoYear === selectedYear;
      marker.setOpacity(show ? 1 : 0);
    });
  }

  function updateButtons(activeYear) {
    const buttons = container.querySelectorAll(".year-button");
    buttons.forEach(btn => btn.classList.remove("active"));
    const target = [...buttons].find(b => b.textContent === (activeYear || "Все"));
    if (target) target.classList.add("active");
  }
}

function setupDateSearch() {
  const input = document.getElementById("caption-search");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    filterByDateQuery(query);
  });
}

function filterByDateQuery(query) {
  allMarkers.forEach(marker => {
    const popup = marker.getPopup();
    if (!popup) return;

    const content = popup.getContent();
    const match = content.match(/(\d{2})-(\d{2})/);
    if (!match) return;

    const [ , month, day ] = match;
    const fullDate = `${marker.options.photoYear}${month}${day}`;

    marker.setOpacity(
      query === "" || fullDate.includes(query) ? 1 : 0
    );
  });
}

function applyTileLayer() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

document.getElementById("caption-search").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  filterByDateQuery(query);
});

initMap();