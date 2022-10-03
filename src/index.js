import "./styles.css";
import "./leaflet/leaflet.css"
import "./leaflet/leaflet"

const fetchData = async () => {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"

    const response = await fetch(url);
    const geoData = await response.json();
    
    initMap(geoData)
}

const initMap = (data) => {
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJson = L.geoJSON(data, {
        onEachFeature: getFeature,
        style: getStyle
    }).addTo(map)

    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map);

    let google = L.tileLayer("https://{s}.google.com/vt/lyrs=s@221097413,traffic&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        minZoom: 2,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map)

    let baseMaps = {
        "OpenStreetMap": osm,
        "Google Maps": google
    }

    let overlayMaps = {
        "Suomen kunnat": geoJson
    }

    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    map.fitBounds(geoJson.getBounds())
    
}

const getFeature = (feature, layer) => {
    //console.log(feature)
    //layer.bindPopup(`<p>${feature.properties.name}</p>`)
    layer.bindTooltip(`<p>${feature.properties.name}</p>`).openTooltip()
}

const getStyle = (feature) => {
    return {
        weight: 2
    }
}

fetchData()