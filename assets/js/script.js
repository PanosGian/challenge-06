//Reference: this code is primarily based on previous work published at: 
//
//https://github.com/rhw-git/challenge-06-Weather-Dashboard
//
//However, in the cuurent excercise the coded was significantly updated,
//as the openweather API does not provide for free daily forecasts
//The forecast functions was significantly updated to reflect the daily statistics, i.e. min max and 
//the weather icon with the highest frequency of occurence for each day.


// set global variables
var citiesListArr = [];
var numOfCities = 9;
var personalAPIKey = "appid=162defe34a10846fe731a77e919eaf2c";
var unit = "units=metric";
var dailyWeatherApi = "https://api.openweathermap.org/data/2.5/weather?q=";
var forecastWeatherApi = "https://api.openweathermap.org/data/2.5/forecast?";


// select from html element
var searchCityForm = $("#searchCityForm");
var searchedCities = $("#searchedCityLi");

//---------- fetch weather info from OpenWeather---------
var getCityWeather = function (cityName) {
  // concatenate url string
  var apiUrl = dailyWeatherApi + cityName + "&" + personalAPIKey + "&" + unit;
  // fetch the data from the url
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      return response.json().then(function (response) {
        $("#cityName").html(response.name);

        // display date
        var unixTime = response.dt;
        var date = moment.unix(unixTime).format("DD/MM/YY");

        $("#currentdate").html(date);
        // weather icon
        var weatherIncoUrl = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
        $("#weatherIconToday").attr("src", weatherIncoUrl);
        $("#tempToday").html(response.main.temp + " \u00B0C");
        $("#humidityToday").html(response.main.humidity + " %");
        $("#windSpeedToday").html(response.wind.speed + " m/sec");
        // get city coordinates
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        getForecast(lat, lon);
      });
    } else {
      alert("Please provide a valid city name.");
    }
  });
};


var getForecast = function (lat, lon) {
  // format the OpenWeather api url
  var apiUrl =
    forecastWeatherApi +
    "lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=current,minutely,hourly" +
    "&" +
    personalAPIKey +
    "&" +
    unit;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var i = j = 0;
      do {// (var i = 0; i < response.list.length ; i++) {// i.e. for each day
        //Forecast is provided in 3-hour slots
        //.. some stats are required to gete the min, max values and the icon with the highest freequency 
        //of occurence.............
        var temps = [],
          humidities = [],
          winds = [];
        var weatherIconURLs = [];
        var unixTime;

        do {
          var iconURL = "http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png";
          weatherIconURLs.push(iconURL);
          temps.push(response.list[i].main.temp);
          winds.push(response.list[i].wind.speed);
          humidities.push(response.list[i].main.humidity);

          var weatherDateTime = response.list[i].dt_txt.split(" ");
          var wTime = weatherDateTime[1];
          if (wTime == "21:00:00") {//get the date stamp
            unixTime = response.list[i].dt;
          }
          i += 1;
        } while (wTime != "00:00:00");

        var windMin = Math.min(...winds),
          windMax = Math.max(...winds),
          tempMin = Math.min(...temps),
          tempMax = Math.max(...temps),
          humMin = Math.min(...humidities),
          humMax = Math.max(...humidities);

        var iconMain = getMainIcon(weatherIconURLs);
        var txtTemp = tempMin + " - " + tempMax + " \u00B0C";
        var txtWind = windMin + " - " + windMax + " m/sec";
        var txtHumidity = humMin + " - " + humMax + " %";
        var date = moment.unix(unixTime).format("DD/MM/YY");
        j += 1
        $("#Date" + j).html(date);
        $("#weatherIconDay" + j).attr("src", iconMain);
        $("#tempDay" + j).html(txtTemp);
        $("#windDay" + j).html(txtWind);
        $("#humidityDay" + j).html(txtHumidity);

      } while (i < response.list.length);
    });
};

var getMainIcon = function (icons) {

  var URLs = Array.from(new Set(icons));
  var elCounts = [];
  for (var el = 0; el < URLs.length; el++) {
    elCounts.push(elementCount(icons, URLs[el]));
  }
  var maxCount = Math.max(...elCounts);
  var idMaxFrequency = elCounts.indexOf(maxCount);
  return URLs[idMaxFrequency];

}

function elementCount(arr, element) {
  return arr.filter((currentElement) => currentElement == element).length;
};




//create button..................
var creatBtn = function (btnText) {
  var btn = $("<button>")
    .text(btnText)
    .addClass("list-group-item list-group-item-action")
    .attr("type", "submit");
  return btn;
};

//Load saved cities names from localStorage...........
var loadSavedCity = function () {
  citiesListArr = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesListArr == null) {
    citiesListArr = [];
  }
  for (var i = 0; i < citiesListArr.length; i++) {
    var cityNameBtn = creatBtn(citiesListArr[i]);
    searchedCities.append(cityNameBtn);
  }
};


//save searched city in to local storage starts......................
var saveCityName = function (searchCityName) {
  var newcity = 0;
  citiesListArr = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesListArr == null) {
    citiesListArr = [];
    citiesListArr.unshift(searchCityName);
  } else {
    for (var i = 0; i < citiesListArr.length; i++) {
      if (searchCityName.toLowerCase() == citiesListArr[i].toLowerCase()) {
        return newcity;
      }
    }
    if (citiesListArr.length < numOfCities) {
    
      citiesListArr.unshift(searchCityName);
    } else {
      // control the length of the array. do not allow to save more than 10 cities
      citiesListArr.pop();
      citiesListArr.unshift(searchCityName);
    }
  }
  localStorage.setItem("weatherInfo", JSON.stringify(citiesListArr));
  newcity = 1;
  return newcity;
};


//create button with searched city.....................
var createCityNameBtn = function (searchCityName) {
  var saveCities = JSON.parse(localStorage.getItem("weatherInfo"));
  // check the searchCityName parameter against all children of citiesListArr
  if (saveCities.length == 1) {
    var cityNameBtn = creatBtn(searchCityName);
    searchedCities.prepend(cityNameBtn);
  } else {
    for (var i = 1; i < saveCities.length; i++) {
      if (searchCityName.toLowerCase() == saveCities[i].toLowerCase()) {
        return;
      }
    }
    // check whether there are already have too many elements in this list of button
    if (searchedCities[0].childElementCount < numOfCities) {
      var cityNameBtn = creatBtn(searchCityName);
    } else {
      searchedCities[0].removeChild(searchedCities[0].lastChild);
      var cityNameBtn = creatBtn(searchCityName);
    }
    searchedCities.prepend(cityNameBtn);
    $(":button.list-group-item-action").on("click", function () {
      BtnClickHandler(event);
    });
  }
};

//Load saved cities...................................
loadSavedCity();



// event handler form submit ....................
var formSubmitHandler = function (event) {
  event.preventDefault();
  // name of the city
  var searchCityName = $("#searchCity").val().trim();
  var newcity = saveCityName(searchCityName);
  getCityWeather(searchCityName);
  if (newcity == 1) {
    createCityNameBtn(searchCityName);
  }
};
var BtnClickHandler = function (event) {
  event.preventDefault();
  // name of the city
  var searchCityName = event.target.textContent.trim();
  getCityWeather(searchCityName);
};


//call functions with submit button...............................
$("#searchCityForm").on("submit", function () {
  formSubmitHandler(event);
});

$(":button.list-group-item-action").on("click", function () {
  BtnClickHandler(event);
});

function showFeedbackDialog() {
  alert("under development");
}