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

  const yearSet = new Set();
  const monthSet = new Set();
  const daySet = new Set();

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

    yearSet.add(year);
    monthSet.add(month);
    daySet.add(day);
  });

  populateDateFilters([...yearSet], [...monthSet], [...daySet]);
}

function applyTileLayer() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

function populateDateFilters(years, months, days) {
  const yearSel = document.getElementById("filter-year");
  const monthSel = document.getElementById("filter-month");
  const daySel = document.getElementById("filter-day");

  // сортировка по возрастанию
  years.sort().forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  months.sort().forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    monthSel.appendChild(opt);
  });

  days.sort().forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    daySel.appendChild(opt);
  });

  // 📆 Обработчик фильтров
  [yearSel, monthSel, daySel].forEach(el => {
    el.addEventListener("change", () => {
      const selectedYear = yearSel.value;
      const selectedMonth = monthSel.value;
      const selectedDay = daySel.value;

      allMarkers.forEach(marker => {
        const content = marker.getPopup().getContent();
        const captionMatch = content.match(/(\d{2})-(\d{2})<\/div>/);

        if (!captionMatch) {
          marker.setOpacity(0);
          return;
        }

        const [ , m, d ] = captionMatch;
        const y = marker.options.photoYear;

        const match =
          (selectedYear === "" || y === selectedYear) &&
          (selectedMonth === "" || m === selectedMonth) &&
          (selectedDay === "" || d === selectedDay);

        marker.setOpacity(match ? 1 : 0);
      });
    });
  });
}

initMap();