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

// Containers for miniCard (forecastSection)


// Format and display 5-day forecast
function miniCard(temp, wind, humidity, date, icon) {

    // Column container
    var col = $('<div class="col-4 card border-warning m-2 p-2">').css("max-width", "fit-content");
    // Card body
    var cardBody = $('<div class="card-body">');
    var dateText = $('<h3 class="card-title">').text(date);
    cardBody.append(dateText)
    var img = $('<img>');
    img.attr("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);
    cardBody.append(img);
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);

    col.append(cardBody);
    forecastSection.append(col);

    // Add next 5 days to local storage
    var storage = JSON.parse(localStorage.getItem(cityInput));
    if (!storage.prevForecast) {
        addForecastToLocalStorage(cityInput, date, temp, wind, humidity, icon);
    } else if (storage.prevForecast && storage.prevForecast.length == 5) {
        return;
    } else {
        addForecastToLocalStorage(cityInput, date, temp, wind, humidity, icon);
    }
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
        var title = $('<h3>');
        title.text("5-Day Forecast:");
        forecastSection.append(title);
        for (var i = 0; i < data.list.length - 1; ) {
            // Generate a card for each future forecast
            var date = moment().add(j, 'day').format('M/D/YYYY');
            miniCard(data.list[i].main.temp, data.list[i].wind.speed, data.list[i].main.humidity, date, data.list[i].weather[0].icon)
            if (i === 0) i += 7;
            else i += 8;
            j++;
        }
    });
}

// Create dashboard with the information gathered
function generateMainDashboard(temp, wind, humidity, uvIndex, cityInput, icon) {
    // Card container
    var cardContainer = $('<div class="col card text-bg-dark mb-3 text-center">');
    // Card body; capitalize first letter
    var cardBody = $('<div class="card-body">');
    var date =  moment().format('M/D/YYYY');
    var cardTitle = $('<h3 class="card-title">').text(cityInput + " " + date).css("text-transform", "capitalize");
    cardBody.append(cardTitle)
    var img = $('<img>');
    img.attr("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);
    cardBody.append(img);
    var tempText = $('<p class="card-text">').text("Temp: " + temp + "°F");
    cardBody.append(tempText);
    var windText = $('<p class="card-text">').text("Wind: " + wind + " MPH");
    cardBody.append(windText);
    var humidityText = $('<p class="card-text">').text("Humidity: " + humidity + " %");
    cardBody.append(humidityText);
    var spanUV = $('<span class="p-1">').text(uvIndex);
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
    if (!localStorage.getItem(cityInput)) addToLocalStorage(cityInput, temp, wind, humidity, uvIndex, date, icon);
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
        // Weather icon
        var icon = data.current.weather[0].icon;

        if (!localStorage.getItem(cityInput)) {
            // Call function to generate main dashboard
            generateMainDashboard(temp, wind, humidity, uvIndex, cityInput, icon);
            // Call function to generate 5-day dashboard
            generate5DayDashboard(lat, lon);
        }
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
    var apiCall = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`

    fetch(apiCall)
    .then(response => response.json())
    .then(data => {
        
        // To store each input's latitude and longitud coordinates
        lat = data[0].lat;
        lon = data[0].lon;
        fetchAPI(lat, lon, cityInput);
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

// When user clicks a previous search, populate text from local storage info
prevSearch.click((e) => {
    var btnClicked = $(e.target).attr('data-city');

    // If there is a value for the 'data-city' attribute
    if (btnClicked) {
        cityInput = btnClicked;
        // Clear containers
        dashboard.empty();
        forecastSection.empty();
        var cityInfo = JSON.parse(localStorage.getItem(btnClicked));

        generateMainDashboard(cityInfo.temp, cityInfo.wind, cityInfo.humidity, cityInfo.uvIndex, btnClicked, cityInfo.icon);

        //Title for this section
        var title = $("<h3>");
        title.text("5-Day Forecast:");
        forecastSection.append(title);
        cityInfo.prevForecast.forEach(forecast => {
            miniCard(forecast.temp, forecast.wind, forecast.humidity, forecast.date, forecast.icon);
        })
    }
})

// Displays previous searches
function displayPrevSearch(cityInput) {
    var cityBtn = $('<button type="button" class="btn btn-secondary m-2">');
    cityBtn.text(cityInput);
    cityBtn.attr("data-city", cityInput);
    prevSearch.append(cityBtn);
}

// Add current weather info to local storage
function addToLocalStorage(cityInput, temp, wind, humidity, uvIndex, date, icon) {
    const current = {
        date: date,
        temp: temp,
        wind: wind,
        humidity: humidity,
        uvIndex: uvIndex,
        icon: icon
    }
    
    window.localStorage.setItem(cityInput, JSON.stringify(current))
}

// Add future five dates to local storage
var prevForecast = [];
function addForecastToLocalStorage(cityInput, date, temp, wind, humidity, icon) {
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
        humidity: humidity,
        icon: icon
    }
    prevForecast.push(forecast);
    
    window.localStorage.setItem(cityInput, JSON.stringify({...prevData, prevForecast}));
}

// Load city's weather info upon click
searchBtn.click(fetchGeocode);

// Display previous searches upon page load
$(() => {
    // populate prevSearchArr array with the items in local storage
    var keys = Object.keys(localStorage);
    prevSearchArr = keys.map(key => key);
    
    // Display buttons AND populate dashboard upon click
    prevSearchArr.forEach(cityBtn => {
        displayPrevSearch(cityBtn);
    });
})