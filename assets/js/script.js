// Point to the button in the 'Search for a City' section
var searchBtn = $(".search-btn");
// Input in the search section
var searchInput = $(".search-input");
var apiKey = "f68779a05e2dffd6da000fc8655e5f07";
// To store each input's latitude and longitud coordinates
var latlLon;


// Get latitude and longitude for city entered
function fetchGeocode(input) {
    var apiCall = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`
    
    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        latLon = [data[0].lat, data[0].lon];
    })
}


