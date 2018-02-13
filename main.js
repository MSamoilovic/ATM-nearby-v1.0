var currentLat = 0;
var currentLng = 0;

var resultsOfTheSearch = [];

window.onload = function () {
    var startPos;
    var geoSuccess = function (position) {
        startPos = position;
        document.getElementById('startLat').innerHTML = startPos.coords.latitude;
        document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        currentLat = startPos.coords.latitude;
        currentLng = startPos.coords.longitude;
        searchForATMs();
    };

    navigator.geolocation.getCurrentPosition(geoSuccess);
};

function searchForATMs() {
    var pyrmont = new google.maps.LatLng(currentLat, currentLng);
    console.log("poslate vrednosti", currentLat, currentLng);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15,
        scrollwheel: false
    });

    // Specify location, radius and place types for your Places API search.
    var request = {
        location: pyrmont,
        //    radius: '10000',
        //    name:'Telenor',
        rankBy: google.maps.places.RankBy.DISTANCE,
        types: ['atm']
    };

    // Create the PlaceService and send the request.
    // Handle the callback with an anonymous function.
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            resultsOfTheSearch = results;
            fillTheTable(resultsOfTheSearch);

            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                // If the request succeeds, draw the place location on
                // the map as a marker, and register an event to handle a
                // click on the marker.
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                });

                //   console.log("Rezultat broj "+ i+": ", place);
                //   document.getElementById("primer").innerHTML += "<tr><td>"+results[i].name + "</td></tr>";
            }
        }
    });
}

function fillTheTable(results) {

    var map = "<img src='https://maps.googleapis.com/maps/api/staticmap?";
    map += "center=" + currentLat + "," + currentLng + "&size=600x300&maptype=roadmap";

    document.getElementById("tableResults").innerHTML = "";
    document.getElementById("tableResults").innerHTML += "<table><tr><th>Map</th><th>Name</th><th>Distance</th></tr>";
    for (var i = 0; i < 10; i++) {
        var dist = getDistance(
            { lat: currentLat, lng: currentLng },
            { lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng() }
        );

        var smallMap = "<img src='https://maps.googleapis.com/maps/api/staticmap?";
        smallMap += "center=" + results[i].geometry.location.lat() + "," + results[i].geometry.location.lng() + "&size=200x200&maptype=roadmap"
        smallMap += "&markers=color:blue%7Clabel:S%7C" + results[i].geometry.location.lat() + "," + results[i].geometry.location.lng() + "'>";

        document.getElementById("tableResults").innerHTML += "<tr><td>" + smallMap + "</td><td>" + results[i].name + "</td><td>" + dist + "</td></tr>";
        map += "&markers=color:blue%7Clabel:S%7C" + results[i].geometry.location.lat() + "," + results[i].geometry.location.lng();
    }
    map += "'>";
    document.getElementById("tableResults").innerHTML += "</table>";
    document.getElementById("tableResults").innerHTML += map;
}