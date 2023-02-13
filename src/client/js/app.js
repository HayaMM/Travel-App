import { handleInput } from "./dataHandle.js";

// API keys + base urls
let geoNamesBase = "http://api.geonames.org/searchJSON?q=";
let weatherbitNBase = "https://api.weatherbit.io/v2.0/current?lat=";
let weatherbitFbase = "https://api.weatherbit.io/v2.0/forecast/daily?lat=";
let pixabayBase = "https://pixabay.com/api/?key="
// our API Keys
const weatherbitKEY = "a97183e1a2464051ad6bd46a1be681cc";
const pixabayKEY = "33452966-e4fc612a3d085896ceef0c155";
const geoNamesKEY = "username=haya_api";

const handleSubmit = async (event) => {
    event.preventDefault()
    // user's inputs from the form
    let cityGoTo = document.getElementById('cityTo').value;
    let dateOfTrip = document.getElementById('dateDep').value;
    let endDateOfTrip = document.getElementById('dateRet').value;

    // save dates
    let depDate = new Date(dateOfTrip);
    let theDate = new Date();
    let reDate = new Date(endDateOfTrip);
    // calculate length of trip
    // absolute 
    const lengthofTrip = Math.abs(reDate - depDate);
    // rounds up 
    const lengthHours = Math.ceil(lengthofTrip / (1000 * 60 * 60));

    // calculate diffrent betwen dates number of milliseconds
    let milliTimeDif = depDate.getTime() - theDate.getTime();
    // calculate diffrent betwen dates of days by this equation
    var diffDays = milliTimeDif / (1000 * 3600 * 24);

    // API url->one row
    let geoNameAPI = `${geoNamesBase}${cityGoTo}&${geoNamesKEY}&maxRows=1`;
    let pixabayBaseAPI = `${pixabayBase}${pixabayKEY}&q=${cityGoTo} city&image_type=photo&maxRows=1`;

    // get data we need from geonames api
    let geoNamesData = await fetch(`${geoNameAPI}`)
    // json response
    const dataRes = await geoNamesData.json();
    // Latitude
    let cityLat = dataRes.geonames[0].lat;
    // Longitude 
    let cityLng = dataRes.geonames[0].lng;
    //city
    let cityName = dataRes.geonames[0].name;
    // we want the county
    let countryName = dataRes.geonames[0].countryName;

    // fetch image
    let picC = await fetch(pixabayBaseAPI);
    let picRes = await picC.json();
    const imageURL = picRes.hits[0].largeImageURL;
    // fetch weather
    const weatherReported = await weatherInfo(weatherbitFbase, weatherbitNBase, cityLat, cityLng, weatherbitKEY, diffDays);
    await fetch('http://localhost:8081/sendTrip', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        // body data type must match "Content-Type" header        
        body: JSON.stringify({
            cityPic: imageURL,
            cityGoing: cityName,
            CountryGoing: countryName,
            tripDate: dateOfTrip,
            endDate: endDateOfTrip,
            numOfDays: diffDays,
            lengthOfTrip: lengthHours,
            weather: weatherReported.weather,
            tempH: weatherReported.tempH,
            tempL: weatherReported.tempL
        })
    }).then(async () => {
        // get request
        const callBE = await fetch('http://localhost:8081/all');
        const dataFromBE = await callBE.json();
        editdom(dataFromBE)
    })
}

// weatherInfo function
const weatherInfo = async (weatherbitFbase, weatherbitNBase, cityLat, cityLng, weatherbitKEY, diffDays) => {
    // response 
    let weatherBitFetch;
    // a week is 7 days we will use that to compare to feach witch 
    if (diffDays > 7) {
        // future weather if days>7
        weatherBitFetch = await fetch(`${weatherbitFbase}${cityLat}&lon=${cityLng}&key=${weatherbitKEY}&maxRows=1`)
    } else {
        // current weather days withen a week
        weatherBitFetch = await fetch(`${weatherbitNBase}${cityLat}&lon=${cityLng}&key=${weatherbitKEY}&maxRows=1`)
    }
    try {
        let weatherReport = await weatherBitFetch.json();
        let weather = weatherReport.data[0].weather.description;
        let tempH = weatherReport.data[0].high_temp ? weatherReport.data[0].high_temp : weatherReport.data[0].temp;
        let tempL = weatherReport.data[0].low_temp ? weatherReport.data[0].low_temp : weatherReport.data[0].temp;
        return { weather: weather, tempH: tempH, tempL: tempL }
    } catch (error) { }
}

// edit UI
const editdom = (re) => {
    document.getElementById('cityPic').setAttribute('src', re.cityPic);
    document.getElementById('cityGoing').innerHTML = `City: ${re.cityGoing}, ${re.CountryGoing}`;
    document.getElementById('tripDates').innerHTML = `Leaving date: ${re.tripDate} - Returning date: ${re.endDate}`;
    document.getElementById('numOfDays').innerHTML = `Days you have till trip date: ${re.numOfDays} days`;
    document.getElementById('tripLength').innerHTML = `Length of your trip: ${re.lengthOfTrip} Hours`;
    document.getElementById('weather').innerHTML = `Weather: ${re.weather}`;
    document.getElementById('weatherTemp').innerHTML = `High: ${re.tempH} ~ Low: ${re.tempL}`;
}

export { handleSubmit, handleInput }