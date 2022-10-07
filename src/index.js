import "./styles.css";
import "./leaflet/leaflet.css"
import "./leaflet/leaflet"

const fetchData = async () => {
    const urlGeoData = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const urlPositiveMigrationData = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
    const urlNegativeMigrationData = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";

    const response1 = await fetch(urlGeoData);
    const geoData = await response1.json();

    const response2 = await fetch(urlPositiveMigrationData);
    const positiveMigrationData = await response2.json();

    const response3 = await fetch(urlNegativeMigrationData);
    const negativeMigrationData = await response3.json();

    initMap(geoData, positiveMigrationData, negativeMigrationData)
}

const initMap = (geoData, positiveMigrationData, negativeMigrationData) => {
    //console.log(negativeMigrationData)
    let index = 0;
    //console.log(geoData)

    /*
    negativeMigrationData.dataset.dimension['lähtöalue'].category.label
    */
    //console.log(negativeMigrationData)
    //console.log(positiveMigrationData)
    let migrationData = {}
    for (const [key, value] of Object.entries(negativeMigrationData.dataset.dimension['Lähtöalue'].category.label)) {
        let municipality = value.split(" ")[2]
        let indexOfMunicipality = negativeMigrationData.dataset.dimension['Lähtöalue'].category.index[key]
        //console.log(municipality)
        migrationData[municipality] = {}
        migrationData[municipality].negativeMigration = negativeMigrationData.dataset.value[indexOfMunicipality]
        migrationData[municipality].positiveMigration = positiveMigrationData.dataset.value[indexOfMunicipality]
    
        let hue = Math.pow(migrationData[municipality].positiveMigration/migrationData[municipality].negativeMigration, 3) * 60
        let realHue = hue >= 120 ? 120 : hue
        migrationData[municipality].color = `hsl(${realHue}, 75%, 50%)`
    }
    //console.log(migrationData)

    const getFeature = (feature, layer) => {
        index++;
        //console.log(index)
        //layer.bindPopup(`<p>${feature.properties.name}</p>`)
        layer.bindTooltip(`<p>${feature.properties.name}</p>`).openTooltip()
        //console.log(feature.properties.name)
        /*
        layer.bindPopup(`
            <ul>
                <li>Positive migration: ${migrationData[feature.properties.name.split(" ")[0]].positiveMigration}</li>
                <li>Negative migration: ${migrationData[feature.properties.name.split(" ")[0]].negativeMigration}</li>
            </ul>`
        )
        */
        layer.bindPopup(`<p>${migrationData[feature.properties.name.split(" ")[0]].positiveMigration-migrationData[feature.properties.name.split(" ")[0]].negativeMigration}</p>`)
        //console.log(feature)
        //console.log(feature.properties.nimi, index)
        //console.log(positiveMigrationData)
        //console.log(geoData)
        //console.log(positiveMigrationData.dataset.value[index])
        /*
            `<ul>
                <li>${positiveMigrationData.dataset.value[index]}</li>
                <li>${negativeMigrationData.dataset.value[index]}</li>
            </ul>`
        */
    }

    const getStyle = (feature) => {
        return {
            weight: 2,
            color: migrationData[feature.properties.name.split(" ")[0]].color,
        }
    }

    let map = L.map('map', {
        minZoom: -3
    })

    let geoJson = L.geoJSON(geoData, {
        onEachFeature: getFeature,
        style: getStyle
    }).addTo(map)

    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map);
/*
    let google = L.tileLayer("https://{s}.google.com/vt/lyrs=s@221097413,traffic&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        minZoom: 2,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map)

    let baseMaps = {
        "OpenStreetMap": osm,
        "Google Maps": google
    }
*/
    let baseMaps = {
    "OpenStreetMap": osm
    }
    let overlayMaps = {
        "Suomen kunnat": geoJson
    }

    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    map.fitBounds(geoJson.getBounds())

}


fetchData()