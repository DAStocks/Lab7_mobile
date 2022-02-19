var map = L.map('map').setView([47.037872, -122.900696], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZWpzbGdyIiwiYSI6ImNrMnBtbDF0YzA1d2UzbnJtbHMxcWltOTIifQ.MY_BZXu-EPtwTlxsI_zgcQ'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var cartoData = L.layerGroup().addTo(map);
// change the url below by replacing YourUsername with your Carto username
var url = "https://dastocks.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
// change the Query below by replacing lab_7_name with your table name
var sqlQuery = "SELECT the_geom, description, name FROM lab_7_stocks";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + feature.properties.name + "</b><br>" +
        feature.properties.description
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });

new L.Control.Draw({
    draw : {
        polygon : true,
        polyline : true,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
        '<form>' +
        '<h2>Location Name:</h2><input type="text" id="input_desc"><br>' +
        '<h3>User Name:</h3><input type="text" id="input_name"><br>' +
        '<p><label for="Enjoyment">Eli\'s Enjoyment (1-bad, 3-good)</label></p>' +
        '<input type="range" id="Enjoyment" name="Enjoyment" min="1" max="3"><br>' +
        '<div>' +
        '<input type="Date" value="date" id="Date"><br>' +
        '<p><label for="Date">Date of Survey </label></p>' +
        '</div>' +
        '<p>Issues with location:</p>' +
        '<div>' +
        '<input type="checkbox" id="Traffic" name="Traffic" checked>' +
        '<label for="Traffic">Traffic</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Distance" name="Distance">' +
        '<label for ="Distance">Distance</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Location" name="Location">' +
        '<label for="Location">Location</label>' +
        '</div>' +
        '<p>Amenities:</p>' +
        '<div>' +
        '<input type="checkbox" id="Fountain" name="Fountain" checked>' +
        '<label for="Fountain">Fountains</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Restroom" name="Restroom" checked>' +
        '<label for="Restroom">Restroom</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Slide" name="Slide" checked>' +
        '<label for="Slide">Slides</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Swings" name="Swings">' +
        '<label for ="Swings">Swings</label>' +
        '</div>' +
        '<div>' +
        '<input type="checkbox" id="Jungle" name="Jungle">' +
        '<label for="Jungle">Jungle Gym</label>' +
        '</div>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

function checkboxCheck(a){
var ele = document.getElementsByName(a)
for(i = 0; i < ele.length; i++) {
               if(ele[i].checked) {
                   return ele[i].id
                 }
              else {return null}
           }
}

function setData(e) {

    if(e.target && e.target.id == "submit") {
        var locationName = document.getElementById("input_desc").value;
        var enteredUser = document.getElementById("input_name").value;
        var enteredEnjoyment = document.getElementById('Enjoyment').value;
        var enteredDate = document.getElementById('Date').value;
        var fakeBox = checkboxCheck('Fake');
        var enteredTraffic = checkboxCheck('Traffic');
        var enteredDistance = checkboxCheck('Distance');
        var enteredLocation = checkboxCheck('Location');
        var enteredFountain = checkboxCheck('Fountain');
        var enteredRestroom = checkboxCheck('Restroom');
        var enteredSlide = checkboxCheck('Slide');
        var enteredSwings = checkboxCheck('Swings');
        var enteredJungle = checkboxCheck('Jungle');

        // For each drawn layer
    drawnItems.eachLayer(function(layer) {

			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_7_stocks (the_geom, name, description) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                locationName + "', '" +
                enteredUser + "')";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });

        // Transfer submitted drawing to the CARTO layer
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.input_desc = locationName;
        newData.properties.input_name = enteredUser;
        newData.properties.enjoyment = enteredEnjoyment;
        newData.properties.date = enteredDate;
        newData.properties.fake = fakeBox;
        newData.properties.traffic = enteredTraffic;
        newData.properties.distance = enteredDistance;
        newData.properties.location = enteredLocation;
        newData.properties.fountain = enteredFountain;
        newData.properties.restroom = enteredRestroom;
        newData.properties.slide = enteredSlide;
        newData.properties.swings = enteredSwings;
        newData.properties.jungle = enteredJungle;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

    });
        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
