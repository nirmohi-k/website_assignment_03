// 🔑 Set Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoibmlybW9oaSIsImEiOiJjbTExMGRyNXkwbnh0Mm5vcmtteWJwOWplIn0.MSqHgjuT6rq8AL6lEXDxVQ';

// 🎯 Define projections (fully supported in Mapbox)
const projections = {
    'equalEarth': 'equalEarth',  
    'mercator': 'mercator',  
    'albers': 'albers'  
};

// 🗺️ Initialize Mapbox map
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nirmohi/cm6n48kbc00oq01qq40zk9hjp',
    projection: projections.equalEarth,
    center: [0, 20],  
    zoom: 1.5  
});

// 📂 Load the single GeoJSON dataset
const geojsonUrl = "data/downsampled_geo_data_1.geojson";

let geojsonData = null;

// 🏷️ Create a popup for hover effect
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

// 📡 Fetch and validate GeoJSON
fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        console.log("%c✅ GeoJSON Loaded Successfully", "color: green;");
        geojsonData = data;
        updateMap();
    })
    .catch(error => console.error("%c❌ Error loading GeoJSON:", "color: red;", error));

// 🏗 Function to classify data based on "Value" column
function classifyData(classificationType) {
    if (!geojsonData) return null;

    let values = geojsonData.features.map(f => f.properties.Value);
    let breaks = [];

    if (classificationType === "standardDeviation") {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
        
        breaks = [
            -Infinity,
            mean - stdDev,  
            mean,           
            mean + stdDev,  
            mean + 2 * stdDev,  
            Infinity
        ];
    } else if (classificationType === "jenks") {
        breaks = [Math.min(...values), 1000, 50000, 1000000, Math.max(...values)];
    } else if (classificationType === "quantiles") {
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const q2 = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        breaks = [Math.min(...values), q1, q2, q3, Math.max(...values)];
    }

    geojsonData.features.forEach(f => {
        let val = f.properties.Value;
        let categoryIndex = breaks.findIndex((b, i) => val >= b && val < breaks[i + 1]);
        f.properties.Classification = categoryIndex !== -1 ? categoryIndex : breaks.length - 2;
    });

    return geojsonData;
}

// 🔄 Function to update map when projection/classification changes
function updateMap() {
    const projection = document.getElementById("projectionSelect").value;
    const classification = document.getElementById("classificationSelect").value;

    console.log(`%c🔄 Updating Projection: ${projection}, Classification: ${classification}`, "color: blue;");

    if (!projections[projection]) {
        console.error(`%c❌ Projection "${projection}" is NOT in the projections list!`, "color: red;");
        return;
    }

    let center = [0, 20];
    let zoom = 1.5;

    if (projection === "albers") {
        center = [-96, 37.5];
        zoom = 1;  
    }

    // 🔥 Destroy existing Mapbox instance before updating projection
    document.getElementById("map").innerHTML = "";
    if (map) map.remove();

    // 🛠 Create a NEW Mapbox instance
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/nirmohi/cm6n48kbc00oq01qq40zk9hjp",
        projection: projection,
        center: center,
        zoom: zoom
    });

    const classifiedData = classifyData(classification);

    // 📡 Add new data source when map loads
    map.on("load", function () {
        map.addSource("dataSource", { type: "geojson", data: classifiedData });

        // 🎨 Apply color coding based on classification
        map.addLayer({
            id: "dataLayer",
            type: "fill",
            source: "dataSource",
            paint: {
                "fill-color": [
                    "match",
                    ["get", "Classification"],
                    0, "#440154",  // 🟣 Deep Purple (Lowest Values)
                    1, "#3b528b",  // 🔵 Blue
                    2, "#21918c",  // 🟢 Teal
                    3, "#5ec962",  // 💚 Green
                    4, "#fde725",  // 🟡 Yellow (Highest Values)
                    "#ccc"         // ⚪ Default (light gray)
                ],
                "fill-opacity": 0.7,
                "fill-outline-color": "#000"
            }
        });

        // 🔄 Ensure Mapbox Country Labels are on Top
        map.moveLayer("country-label");  

        // 🖱️ Add hover interaction for country details
        map.on("mousemove", "dataLayer", function (e) {
            if (e.features.length > 0) {
                let feature = e.features[0];
                let countryName = feature.properties.Name || "Unknown";
                let emissions = feature.properties.Value ? feature.properties.Value.toLocaleString() : "No Data";

                popup.setLngLat(e.lngLat)
                    .setHTML(
                        `
                         <span>GHG Emissions: ${emissions} metric tons</span>`
                    )
                    .addTo(map);
            }
        });

        // 🖱️ Remove popup when not hovering
        map.on("mouseleave", "dataLayer", function () {
            popup.remove();
        });
    });

    console.log("%c✅ Layer Updated Successfully", "color: green;");
}

// 🎛 Event Listeners: Update Map on Projection or Classification Change
document.getElementById("projectionSelect").addEventListener("change", updateMap);
document.getElementById("classificationSelect").addEventListener("change", updateMap);
