document.addEventListener("DOMContentLoaded", function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmlybW9oaSIsImEiOiJjbTExMGRyNXkwbnh0Mm5vcmtteWJwOWplIn0.MSqHgjuT6rq8AL6lEXDxVQ';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/nirmohi/cm72v1ilj00ai01s3bjv8h2gy',
        zoom: 10,
        center: [-74, 40.725],
        maxZoom: 15,
        minZoom: 8,
        maxBounds: [[-74.45, 40.45], [-73.55, 41]]
    });

    map.on('load', function () {
        let layers = map.getStyle().layers;
        let firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                firstSymbolId = layers[i].id;
                break;
            }
        }

        // Pedestrian Plazas Layer
        map.addLayer({
            'id': 'pedestrianPlazas',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/NYC_DOT_Pedestrian_Plazas_20250207.geojson'
            },
            'paint': {
                'fill-color': '#ff0000',
                'fill-opacity': 0.7,
            }
        }, firstSymbolId);

        // POPS Layer
        map.addLayer({
            'id': 'popsLayer',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/pops_bldgs_lots.geojson'
            },
            'paint': {
                'fill-color': '#8897bd',
                'fill-opacity': 0.7,
                'fill-outline-color': '#2A5FA1'
            }
        }, firstSymbolId);

        // Subway Stations
        map.addLayer({
            'id': 'subwayStations',
            'type': 'circle',
            'source': {
                'type': 'geojson',
                'data': 'data/MTA_Subway_Stations_20250212.geojson'
            },
            'filter': ['==', ['get', 'ada'], '1'],
            'paint': {
                'circle-color': '#ffff00',
                'circle-radius': 2.5,
                'circle-opacity': 0.9,
                'circle-stroke-color': '#000000',
                'circle-stroke-width': 0.5
            }
        }, firstSymbolId);

        // Parks Layer
        map.addLayer({
            'id': 'parksLayer',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/Parks_Properties_20250213.geojson'
            },
            'paint': {
                'fill-color': '#6ECF68',
                'fill-opacity': 0.6,
                'fill-outline-color': '#4A9F50'
            }
        }, firstSymbolId);

        // Add Legend Above Footer
        const legend = document.createElement("div");
        legend.id = "legend";
        legend.style.position = "absolute";
        legend.style.bottom = "40px";
        legend.style.left = "10px";
        legend.style.background = "rgba(255, 255, 255, 0.8)";
        legend.style.padding = "10px";
        legend.style.borderRadius = "5px";
        legend.innerHTML = `
        <h4>Map Legend</h4>
        <div><span style="background:#ff0000"></span> Pedestrian Plazas</div>
        <div><span style="background:#8897bd; border: 1px solid #8897bd;"></span> POPS (Privately Owned Public Spaces)</div>
        <div><span style="background:#6ECF68; border: 1px solid #4A9F50;"></span> Parks</div>
        <div><span class="circle-legend" style="background:#ffff00; border: 1px solid #FFFF00;"></span> ADA Accessible Subway Station</div>
        `;
        
        document.body.appendChild(legend);
    });
});
