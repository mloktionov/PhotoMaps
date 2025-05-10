function applyFilter() {
    const selectedYear = document.getElementById('yearFilter').value;
    const selectedMonth = document.getElementById('monthFilter').value;
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

    document.getElementById('pointCount').textContent = visibleCount;
}

// === Сброс фильтров ===
function resetFilters() {
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    applyFilter();
}

// === События изменения фильтров ===
document.getElementById('yearFilter').addEventListener('change', applyFilter);
document.getElementById('monthFilter').addEventListener('change', applyFilter);