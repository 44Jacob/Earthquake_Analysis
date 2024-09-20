const init = async () => {
    var map = L.map('map').setView([20,-10], 3);

    let street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    const url1 = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson';
    const url2 = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

    let earthquakes = await d3.json(url1);
    let plates = await d3.json(url2);

    let quakesLayer = new L.layerGroup();
    let tectonicLayer = new L.layerGroup();

    L.geoJSON(plates, {
        color: 'red',
        weight: 4
    }).addTo(tectonicLayer);

    L.geoJSON(earthquakes, {
        style: function (feature) {

            // console.log(feature);
            let mag = feature.properties.mag * 4;
            let depth = feature.geometry.coordinates[2];
            // console.log(depth);

            return {

                radius: mag,
                color: "black",
                fillOpacity: .75,
                weight: 2,
                fillColor:
                    depth < 10 ? 'green' :
                        depth < 30 ? 'lime' :
                            depth < 50 ? 'yellow' :
                                depth < 70 ? 'orange' :
                                    depth < 90 ? 'darkorange' : 'red'
            };
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng);
        }

    }).bindPopup(({ feature: { geometry, properties } }) => {
        let { mag, place, time } = properties;
        let depth = geometry.coordinates[2];
        let date = new Date(time).toLocaleString();

        return `<h5>${place}<br>${date}<br>Magnitude: ${mag}<br>Depth: ${depth}</h5>`;
    }).addTo(quakesLayer);

    // d3.json(url2).then(data => {
    //     let tectonicplates = new L.layerGroup();

    //     L.geoJSON(data, {
    //         color: 'red',
    //         weight: 4
    //     }).addTo(tectonicplates)

    // });
    
    topo.addTo(map)
    quakesLayer.addTo(map)

    L.control.layers(
        {
            'Street Map': street,
            'Topographic Map': topo
        }, {
        'Techtonic Plates': tectonicLayer,
        'Earth Quakes': quakesLayer
        }, {
            collapsed: false
    }).addTo(map)

    // d3.json(url).then(data => {

    //     L.geoJSON(data, {
    //         style: function (feature) {

    //             // console.log(feature);
    //             let mag = feature.properties.mag*4;
    //             let depth = feature.geometry.coordinates[2];
    //             // console.log(depth);

    //             return {

    //                 radius: mag,
    //                 color: "black",
    //                 fillOpacity: .75,
    //                 weight: 2,
    //                 fillColor: 
    //                     depth < 10 ? 'green' : 
    //                     depth < 30 ? 'lime' :
    //                     depth < 50 ? 'yellow' :
    //                     depth < 70 ? 'orange' :
    //                     depth < 90 ? 'darkorange' : 'red'
    //             };
    //         },
    //         pointToLayer: function(geoJsonPoint, latlng) {
    //             return L.circleMarker(latlng);
    //         }

    //     }).bindPopup(({feature:{geometry,properties}}) => {
    //         let {mag,place,time} = properties;
    //         let depth = geometry.coordinates[2];
    //         let date = new Date(time).toLocaleString();

    //         return `<h5>${place}<br>${date}<br>Magnitude: ${mag}<br>Depth: ${depth}</h5>`;
    //     }).addTo(map);
    // });

    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
        let Div = L.DomUtil.create('div', 'legend');

        Div.innerHTML = `
                <div style="background:green;padding:5px;color:white">-10 - 10</div>
                <div style="background:lime;padding:5px;color:white">10 - 30</div>
                <div style="background:yellow;padding:5px;color:black">30 - 50</div>
                <div style="background:orange;padding:5px;color:white">50 - 70</div>
                <div style="background:darkorange;padding:5px;color:white">70 - 90</div>
                <div style="background:red;padding:5px;color:white">90 +</div>
            `;

        return Div
    };

    legend.addTo(map)

}

init();