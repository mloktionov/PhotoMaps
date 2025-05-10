/* === Filter Logic === */


/* === Применить фильтр === */
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

    const pointCount = document.getElementById('pointCount');
    if (pointCount) {
        pointCount.textContent = `Total Points: ${visibleCount}`;
    }
}

/* === Сбросить фильтры === */
function resetFilters() {
    yearSelect.value = 'all';
    monthSelect.value = 'all';
    applyFilter();
}

/* === События === */
yearSelect.addEventListener('change', applyFilter);
monthSelect.addEventListener('change', applyFilter);