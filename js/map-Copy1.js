import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import FilterPanel from './FilterPanel';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// === Восстанавливаем старую логику превью Google Drive ===
const generateGoogleDriveThumbnail = (url) => {
    if (url.includes("drive.google.com")) {
        const match = url.match(/id=([^&]+)/);
        return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : url;
    }
    return url;
};

const MapComponent = () => {
    const mapRef = useRef(null);
    const markersRef = useRef(null);
    const [years, setYears] = useState([]);
    const [allLayers, setAllLayers] = useState([]);

    useEffect(() => {
        if (mapRef.current !== null) {
            console.log("Карта уже инициализирована. Повторный рендер предотвращён.");
            return;
        }

        console.log("Инициализация карты...");
        mapRef.current = L.map('map').setView([20, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        markersRef.current = L.markerClusterGroup();

        fetch('/geojson/photos.geojson')
            .then((response) => response.json())
            .then((data) => {
                const tempYears = new Set();
                const layers = [];

                L.geoJSON(data, {
                    onEachFeature: (feature, layer) => {
                        const { filename, year, month, image } = feature.properties;

                        console.log("Исходная ссылка:", image);

                        // 🟢 Возвращаем логику превью
                        const imageUrl = generateGoogleDriveThumbnail(image);

                        console.log("Сгенерированная ссылка на превью:", imageUrl);

                        const popupContent = `
                            <div>
                                <strong>${filename}</strong><br>
                                Year: ${year}<br>
                                Month: ${month}<br>
                                <img src="${imageUrl}" style="width: 100px; height: auto;" alt="Preview">
                            </div>
                        `;

                        layer.bindPopup(popupContent);
                        markersRef.current.addLayer(layer);
                        layers.push(layer);
                        tempYears.add(year);
                    },
                });

                setAllLayers(layers);
                setYears(Array.from(tempYears));
                mapRef.current.addLayer(markersRef.current);
            })
            .catch((error) => {
                console.error("Ошибка загрузки GeoJSON:", error);
            });

    }, []);

    const applyFilter = (year, month) => {
        markersRef.current.clearLayers();
        let filteredLayers = allLayers;

        if (year !== 'all') {
            filteredLayers = filteredLayers.filter(layer => layer.feature.properties.year === parseInt(year));
        }

        if (month !== 'all') {
            filteredLayers = filteredLayers.filter(layer => String(layer.feature.properties.month).padStart(2, '0') === month);
        }

        filteredLayers.forEach(layer => markersRef.current.addLayer(layer));
    };

    return (
        <>
            <div style={{
                position: "absolute",
                top: "10px",
                left: "80px",
                zIndex: 1000,
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}>
                <FilterPanel
                    years={years}
                    onYearChange={(year) => applyFilter(year, 'all')}
                    onMonthChange={(month) => applyFilter('all', month)}
                    onReset={() => applyFilter('all', 'all')}
                />
            </div>
            <div id="map" style={{ height: "100vh", width: "100vw", position: "absolute", top: 0, left: 0 }} />
        </>
    );
};

export default MapComponent;