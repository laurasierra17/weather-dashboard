// Point to the button in the 'Search for a City' section
var searchBtn = $(".search-btn");
// Input in the search section
var searchInput = $(".search-input");
var apiKey = "f68779a05e2dffd6da000fc8655e5f07";


// Fetch data from api when button is clicked
function fetchAPI(lat, lon) {    
    // API call
    var apiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${apiKey}`
    fetch(apiCall)
        .then(response => response.json())
        .then(data => console.log(data));
    
}

// Get latitude and longitude for city entered
function fetchGeocode() {
    var apiCall = `http://api.openweathermap.org/geo/1.0/direct?q=${searchInput.val()}&limit=5&appid=${apiKey}`
    
    fetch(apiCall)
        .then(response => response.json())
        .then(data => {
            // To store each input's latitude and longitud coordinates
            var lat = data[0].lat.toFixed(2);
            var lon = data[0].lon.toFixed(2);
            fetchAPI(lat, lon)
        })
}

// Load city's weather info upon click
searchBtn.click(fetchGeocode);