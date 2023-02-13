// Setup empty JS object to act as endpoint for all routes
let travelData = {};

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');

// Start up an instance of app
const app = express()

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'))

// server port is 8081 because webpack is 8080
const port = 8081;

app.get('/', function (req, res) {
    // using index file from dist
    res.sendFile('dist/index.html')
})

// app listen to for incoming requests
app.listen(port, function () {
    console.log(`running at http://localhost:${port}/`);
})

// GET route setup
app.get('/all', getTrip);
//  getTrip function
function getTrip(request, response) {
    // send the response to the endpoint and stop script's processing 
    response.send(travelData).status(200);
};

// POST request setup
app.post('/sendTrip', postTrip);
// postURL function
function postTrip(request, response) {
    // save req.body in data to shortcut
    const data = request.body;
    // assign  object
    travelData = {
        cityPic: data.cityPic,
        cityGoing: data.cityGoing,
        CountryGoing: data.CountryGoing,
        tripDate: data.tripDate,
        endDate: data.endDate,
        numOfDays: data.numOfDays,
        lengthOfTrip: data.lengthOfTrip,
        weather: data.weather,
        tempH: data.tempH,
        tempL: data.tempL
    };
    // send the response to the endpoint and stop script's processing 
    response.send(travelData).status(200).end();
};

// export app instance 
module.exports = app;