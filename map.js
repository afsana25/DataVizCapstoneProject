document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    // 1. Initialize Map
    var map = L.map('leaflet-map').setView([33.5, -120], 6); 

    // FIXED: Corrected the TileLayer URL string
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // 2. Fetch Data
    fetch('map_data.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                renderMapMarkers(data);
            } else {
                showMapError("Loaded 'map_data.json' is empty.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMapError(`Could not load markers: ${error.message}`);
        });

    function renderMapMarkers(data_to_plot) {
        // AUTO-DETECT COLUMN NAMES (Prevents "undefined columns" error)
        const firstRow = data_to_plot[0];
        const latKey = Object.keys(firstRow).find(k => k.toLowerCase().includes('lat'));
        const lonKey = Object.keys(firstRow).find(k => k.toLowerCase().includes('lon') || k.toLowerCase().includes('lng'));
        const tempKey = Object.keys(firstRow).find(k => k.toLowerCase().includes('t_deg') || k.toLowerCase().includes('temp'));

        const temps = data_to_plot.map(d => d[tempKey]).filter(t => t != null);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        const colorPalette = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
        
        const tempColorScale = d3.scaleQuantize()
            .domain([minTemp, maxTemp])
            .range(colorPalette);

        data_to_plot.forEach(function(station) {
            // FIXED: Using detected keys instead of hardcoded .lat/.lon
            if (station[latKey] && station[lonKey]) {
                L.circleMarker([station[latKey], station[lonKey]], {
                    radius: 6,
                    fillColor: tempColorScale(station[tempKey]),
                    color: '#fff',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.85
                }).bindPopup(`
                    <div style="font-family: 'Poppins', sans-serif;">
                        <b style="color:#00b4d8;">Station:</b> ${station.cast_sta_id || 'N/A'}<br/>
                        <b style="color:#00b4d8;">Temp:</b> ${station[tempKey].toFixed(2)}&deg;C
                    </div>
                `).addTo(map);
            }
        });

        // 3. Add Legend
        addLegend(map, tempColorScale, colorPalette, minTemp, maxTemp);
    }

    function addLegend(map, scale, palette, min, max) {
        var legend = L.control({position: 'bottomleft'});
        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend');
            div.style.cssText = "background:white; padding:10px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-family:sans-serif; font-size:12px;";
            div.innerHTML = '<b>Temp (&deg;C)</b><br>';
            
            const thresholds = scale.thresholds();
            for (let i = 0; i < palette.length; i++) {
                let from = (i === 0) ? min : thresholds[i-1];
                let to = (i === palette.length - 1) ? max : thresholds[i];
                div.innerHTML += `<i style="background:${palette[i]}; width:12px; height:12px; display:inline-block; margin-right:5px;"></i> ${from.toFixed(1)}–${to.toFixed(1)}<br>`;
            }
            return div;
        };
        legend.addTo(map);
    }

    function showMapError(msg) {
        mapContainer.innerHTML = `<div style="color:red; padding:20px;">${msg}</div>`;
    }
});