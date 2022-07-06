var apiKey = "f68779a05e2dffd6da000fc8655e5f07";
// Point to the button in the 'Search for a City' section
var searchBtn = $(".search-btn");
// Input in the search section
var searchInput = $(".search-input");
var cityInput;
// Point to previous search history section
var prevSearch = $(".prev-section");
// Point to main dashboard
var dashboard = $(".dashboard");
// Point to section for the 5-day forecast
var forecastSection = $(".forecast");


// Data used to display information of the weather
var temp;
var wind;
var humidity;
var uvIndex;

// Format and display 5-day forecast
function miniCard(day, j) {
    temp = day.main.temp;
    wind = day.wind.speed;
    humidity = day.main.humidity;

    var date = moment().add(j, 'day').format('M/D/YYYY');

    // Column container
    var col = $('<div class="card border-warning mb-3">').css("max-width", "18rem");
    // Card body
    var cardBody = $('<div class="card-body">');
    var dateText = $('<h3 class="card-title">').text(date);
    cardBody.append(dateText)
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);

    col.append(cardBody);
    forecastSection.append(col);

    // Add next 5 days to local storage
    addForecastToLocalStorage(cityInput, date, temp, wind, humidity);
}

// Create dashboard for the 5-day forecast
function generate5DayDashboard(lat, lon) {
    var apiCall = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        // To indicate how many days to add to current day
        var j = 1;
        //Title for this section
        var title = $("<h3>");
        title.text("5-Day Forecast:");
        forecastSection.append(title);
        for (var i = 0; i < data.list.length - 1; ) {
            // Generate a card for each future forecast
            miniCard(data.list[i], j);
            if (i === 0) i += 7;
            else i += 8;
            j++;
        }
    });
}

// Create dashboard with the information gathered
function generateMainDashboard(temp, wind, humidity, uvIndex, cityInput) {
    // Card container
    var cardContainer = $('<div class="col-12 card text-bg-dark mb-3">').css("max-width", "18rem");
    // Card body; capitalize first letter
    var cardBody = $('<div class="card-body">');
    var date =  moment().format('M/D/YYYY');
    var cardTitle = $('<h3 class="card-title">').text(cityInput + " " + date).css("text-transform", "capitalize");
    cardBody.append(cardTitle)
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);
    var spanUV = $('<span>').text(uvIndex);
    var uvIndexText = $('<p class="card-text">').text("UV Index: ");
    uvIndexText.append(spanUV);


    // Give background color to UV Index depending on its condition
    if (uvIndex < 3) {
        spanUV.addClass("bg-success text-white");
    } else if (uvIndex >= 3 || uvIndex < 8) {
        spanUV.addClass("bg-warning text-dark");
    } else {
        spanUV.addClass("bg-danger text-white");
    }
    
    cardBody.append(uvIndexText);
    cardContainer.append(cardBody);
    
    // Append container to the HTML
    dashboard.append(cardContainer);

    // Save current to local storage
    // Add cityInput to the previous search section and local storage
    addToLocalStorage(cityInput, temp, wind, humidity, uvIndex, date);
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
    var lat = 0;
    var lon = 0;
    // Clear containers
    dashboard.empty();
    forecastSection.empty();

    // Grab input value
    cityInput = searchInput.val();
    var apiCall = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`

    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        
        // To store each input's latitude and longitud coordinates
        lat = data[0].lat;
        lon = data[0].lon;

        fetchAPI(lat, lon, cityInput)
    })

    // Populate previous searches section
    addToPrevSearch(cityInput);

    // Clear search input
    searchInput.val("");
    // Clear array used to store next 5 days in local storage
    prevForecast = [];
}


// Populate previous search section
var prevSearchArr = [];
function addToPrevSearch(cityInput) {
    // create data attribute set to the city name
    if (!prevSearchArr.includes(cityInput)) {
        prevSearchArr.push(cityInput);
    }
    
    // Display previous searches
    displayPrevSearch(cityInput);
    
}

// Displays previous searches
function displayPrevSearch(cityInput) {
    var cityBtn = $('<button type="button" class="btn btn-secondary">');
    cityBtn.text(cityInput);
    cityBtn.attr("data-city", cityInput);
    prevSearch.append(cityBtn);
}

// Add current weather info to local storage
function addToLocalStorage(cityInput, temp, wind, humidity, uvIndex, date) {
    const current = {
        date: date,
        temp: temp,
        wind: wind,
        humidity, humidity,
        uvIndex, uvIndex
    }
    
    window.localStorage.setItem(cityInput, JSON.stringify(current))
}

// Add future five dates to local storage
var prevForecast = [];
function addForecastToLocalStorage(cityInput, date, temp, wind, humidity) {
    // Ensures previous data on local storage doesn't get replaced, but added to it
    var prevData = localStorage.getItem(cityInput);
    prevData = JSON.parse(prevData);
    
    // Check if there's already information on forecast
    if (prevData.forecast) {
        prevForecast.push(prevData.forecast);
    }
    
    var forecast = {
        date: date,
        temp: temp,
        wind: wind,
        humidity: humidity
    }
    prevForecast.push(forecast);
    
    window.localStorage.setItem(cityInput, JSON.stringify({...prevData, prevForecast}));
}

// Load city's weather info upon click
searchBtn.click(fetchGeocode);

// When user clicks a previous search, populate text from local storage info

// Display previous searches upon page load
$(() => {
    // populate prevSearchArr array with the items in local storage
    var keys = Object.keys(localStorage);
    prevSearchArr = keys.map(key => key);
    
    prevSearchArr.forEach(search => displayPrevSearch(search));
})