var apiKey = "f68779a05e2dffd6da000fc8655e5f07";
// Point to the button in the 'Search for a City' section
var searchBtn = $(".search-btn");
// Input in the search section
var searchInput = $(".search-input");
// Point to previous search history section
var prevSearch = $(".results-section");
// Point to section for the 5-day forecast
var forecastSection = $(".forecast");

// Data used to display information of the weather
var temp;
var wind;
var humidity;
var uvIndex;

function miniCard(day) {
    // <div class="col-2 card border-warning mb-3" style="max-width: 18rem;">
    //     <div class="card-header">Header</div>
    //     <div class="card-body">
    //         <h5 class="card-title">Warning card title</h5>
    //         <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    //     </div>
    // </div>

    temp = day.main.temp;
    wind = day.wind.speed;
    humidity = day.main.humidity;

    // Column container
    var col = $('<div class="card border-warning mb-3">').css("max-width", "18rem");
    // Card body
    var cardBody = $('<div class="card-body">');
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);

    col.append(cardBody);
    forecastSection.append(col);
}

// Create dashboard for the 5-day forecast
function generate5DayDashboard(lat, lon) {
    var apiCall = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        for (var i = 0; i < data.list.length; ) {
            // Generate a card for each future forecast
            miniCard(data.list[i]);
            if (i === 0) i += 7;
            else i += 8;
        }
    });
}

// Create dashboard with the information gathered
function generateMainDashboard(temp, wind, humidity, uvIndex, cityInput) {
    var dashboard = $(".dashboard");
    // Card container
    var cardContainer = $('<div class="col-12 card text-bg-dark mb-3">').css("max-width", "18rem");
    // Card body; capitalize first letter
    var cardBody = $('<div class="card-body">');
    var cardTitle = $('<h3 class="card-title">').text(cityInput).css("text-transform", "capitalize");
    cardBody.append(cardTitle)
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);
    var uvIndexText = $('<p class="card-text">').text("UV Index: " + uvIndex);
    cardBody.append(uvIndexText);
    cardContainer.append(cardBody);
    
    // Append container to the HTML
    dashboard.append(cardContainer);
}


// Fetch data from api when button is clicked to populate dashboard
function fetchAPI(lat, lon, cityInput) {    
    // API call
    var apiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude={part}&appid=${apiKey}`
    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        // Retrieve data needed for the dashboard
        temp = data.current.temp;
        wind = data.current.wind_speed;
        humidity = data.current.humidity;
        uvIndex = data.current.uvi;

        // Call function to generate main dashboard
        generateMainDashboard(temp, wind, humidity, uvIndex, cityInput);
        // Call function to generate 5-day dashboard
        generate5DayDashboard(lat, lon);
    });
}

// Get latitude and longitude for city entered
function fetchGeocode() {
    var cityInput = searchInput.val();
    var apiCall = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`

    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        // To store each input's latitude and longitud coordinates
        var lat = data[0].lat;
        var lon = data[0].lon;

        fetchAPI(lat, lon, cityInput)
    })
}

// Load city's weather info upon click
searchBtn.click(fetchGeocode);


// Check local storage as soon as the page loads
// $(function () {

// })

// page starts
// 1. check local storage to see if there are any values already there
    // a. if there is, populate prev cities list
    // when those cities are clicked, the data for the dashboard is pulled from the local storage
    // b. if there is not, carry as usual
// 2. data to push to local storage:
    // - city name
    // - date (momentjs)
    // - temp
    // - wind
    // - humidity
    // - uv index 