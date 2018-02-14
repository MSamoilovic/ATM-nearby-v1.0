var currentLat = 0;
var currentLng = 0;

var currentSort = 0;
var multicurrency = false;

var resultsOfTheSearch = [];

var resultsRepacked = [];

window.onload = function () {
    var startPos;
    var geoSuccess = function (position) {
        startPos = position;
        currentLat = startPos.coords.latitude;
        currentLng = startPos.coords.longitude;
        initialize();
    };

    navigator.geolocation.getCurrentPosition(geoSuccess);
};

function initialize() {
    var pyrmont = new google.maps.LatLng(currentLat, currentLng);
    console.log("poslate vrednosti", currentLat, currentLng);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 16,
        scrollwheel: true
    });

    new google.maps.Marker({
        map: map,
        position: pyrmont,
        color: "blue",
        label: "U"
    });

    var request = {
        location: pyrmont,
        rankBy: google.maps.places.RankBy.DISTANCE,
        types: ['atm']
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            resultsOfTheSearch = results;
            repackResults();
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    label: i + 1 + ''
                });
            }
            document.getElementById("loader").style.display = "none";
        }
    });
}

function toggleMap() {
    var currentState = document.getElementById("responsiveMap").style.display;
    if (currentState == "block") {
        document.getElementById("responsiveMap").style.display = "none";
        document.getElementById("toggleMapBtn").innerHTML = "<i class='fa fa-plus-square-o' aria-hidden='true'></i>&nbsp;Show Map";
    }
    else {
        document.getElementById("responsiveMap").style.display = "block";
        document.getElementById("toggleMapBtn").innerHTML = "<i class='fa fa-minus-square-o' aria-hidden='true'></i>&nbsp;Hide Map";
    }
}

function toggleList() {
    var currentState = document.getElementById("listDisplay").style.display;
    if (currentState == "block") {
        document.getElementById("listDisplay").style.display = "none";
        document.getElementById("toggleListBtn").innerHTML = "<i class='fa fa-plus-square-o' aria-hidden='true'></i>&nbsp;Show List";
    }
    else {
        document.getElementById("listDisplay").style.display = "block";
        document.getElementById("toggleListBtn").innerHTML = "<i class='fa fa-minus-square-o' aria-hidden='true'></i>&nbsp;Hide List";
    }
}

function multicurrencyFilter(cb) {
    multicurrency = cb.checked;
    generateTable(currentSort, multicurrency);
}

function changeSort() {
    if (currentSort == 1) currentSort = 0
    else currentSort = 1;
    generateTable(currentSort, multicurrency);
}

function repackResults() {
    resultsRepacked = [];
    for (var i = 0; i < resultsOfTheSearch.length; i++) {

        var mapImg = "<img src='https://maps.googleapis.com/maps/api/staticmap?";
        mapImg += "center=" + resultsOfTheSearch[i].geometry.location.lat() + "," + resultsOfTheSearch[i].geometry.location.lng() + "&size=100x100&maptype=roadmap"
        mapImg += "&markers=color:blue%7Clabel:" + (i + 1) + "%7C" + resultsOfTheSearch[i].geometry.location.lat() + "," + resultsOfTheSearch[i].geometry.location.lng() + "'>";

        var result = {
            mapImg: mapImg,
            name: resultsOfTheSearch[i].name,
            distance: Math.floor(getDistance(
                { lat: currentLat, lng: currentLng },
                { lat: resultsOfTheSearch[i].geometry.location.lat(), lng: resultsOfTheSearch[i].geometry.location.lng() }
            ))
        };

        resultsRepacked.push(result);
    }
    generateTable(currentSort, multicurrency);
}

function generateTable(sortDirection, multicurrency) {

    var tableRows = [];
    if (multicurrency) {
        tableRows = resultsRepacked.filter((row) => row.name.indexOf('Telenor') > -1);
    }
    else {
        tableRows = resultsRepacked;
    }

    if (sortDirection == 0) {
        tableRows = tableRows.sort((el1, el2) => parseFloat(el2.distance) - parseFloat(el1.distance));
    }
    else {
        tableRows = tableRows.sort((el1, el2) => parseFloat(el1.distance) - parseFloat(el2.distance));
    }

    drawTable(tableRows);

}

function drawTable(tableRows) {
    document.getElementById("resultList").innerHTML = "";
    var table = document.getElementById("resultList");

    var header = table.createTHead();
    var hrow = header.insertRow(0);
    var hcell1 = hrow.insertCell(0);
    var hcell2 = hrow.insertCell(1);
    var hcell3 = hrow.insertCell(2);
    hcell1.innerHTML = "<b>Map</b>";
    hcell2.innerHTML = "<b>Name</b>";
    hcell3.innerHTML = "<button class='btn btn-link' id='distLink' onclick='changeSort()'><b>Distance</b></button>";

    for (var i = 0; i < 10; i++) {
        if (i < tableRows.length) {
            var row = table.insertRow(i + 1);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            cell1.innerHTML = tableRows[i].mapImg;
            cell2.innerHTML = tableRows[i].name;
            cell3.innerHTML = tableRows[i].distance + 'm';
        }
    }
}