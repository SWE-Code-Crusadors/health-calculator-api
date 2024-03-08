const express = require('express')
app = express()

const cors = require("cors")

var url = require('url');
var dt = require('./date-time');

const port = process.env.PORT || 3000
const majorVersion = 1
const minorVersion = 3

var riskPoints = 70

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: '*' }))

// The app.get functions below are being processed in Node.js running on the server.
// Implement a custom About page.
app.get('/about', (request, response) => {
	console.log('Calling "/about" on the Node.js server.')
	response.type('text/plain')
	response.send('About Node.js on Azure Template.')
})

app.get('/version', (request, response) => {
	console.log('Calling "/version" on the Node.js server.')
	response.type('text/plain')
	response.send('Version: '+majorVersion+'.'+minorVersion)
})

app.get('/api/ping', (request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send('ping response')
	console.log('Current Risk Points:' + riskPoints)
})

// Calculates risk depending on age 
app.get('/age', (request, response) => {
	console.log('Calling "/age" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	let age = parseInt(inputs.age)
	console.log('Age:' + age)

	if (age < 30){
		riskPoints = riskPoints + 0
	}
	else if (age < 45){
		riskPoints = riskPoints + 10
	}
	else if (age < 60){
		riskPoints = riskPoints + 20
	}
	else {
		riskPoints = riskPoints + 30
	}
	console.log('Current Risk Points:' + riskPoints)
})

// Calculates BMI and then calculates risk associated based on calculation
app.get('/calculate-bmi', (request, response) => {
	console.log('Calling "/calculate-bmi" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	const heightFeet = parseInt(inputs.feet)
	const heightInches = parseInt(inputs.inches)
	const weight = parseInt(inputs.lbs)

	console.log('Height:' + heightFeet + '\'' + heightInches + '\"')
	console.log('Weight:' + weight + ' lbs.')

	// Calculate BMI
	var BMI = 703 * (weight / Math.pow((heightInches+(heightFeet*12)),2))
	console.log('BMI:' + BMI)

	if (BMI < 24.9){
		riskPoints = riskPoints + 0
	}
	else if (BMI > 25 && BMI < 29.9){
		riskPoints = riskPoints + 30
	}
	else if (BMI > 30 && BMI < 34.9){
		riskPoints = riskPoints + 75
	}
	console.log('Current Risk Points:' + riskPoints)
})

// Calculates risk based on blood pressure
app.get('/blood-pressure', (request, response) => {
	console.log('Calling "/blood-pressure" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	let bloodPressure = parseInt(inputs.bp)
	console.log('Blood Pressure:' + bloodPressure)

	if (bloodPressure < 120) {
		riskPoints = riskPoints + 0
	}
	else if (bloodPressure > 120 && bloodPressure < 129) {
		riskPoints = riskPoints + 15
	}
	else if (bloodPressure > 130 && bloodPressure < 139) {
		riskPoints = riskPoints + 30
	}
	else if (bloodPressure > 140 && bloodPressure < 179) {
		riskPoints = riskPoints + 75
	}
	else {
		riskPoints = riskPoints + 100
	}
	console.log('Current Risk Points:' + riskPoints)
})

// Calculates risk based on family disease
app.get('/disease', (request, response) => {
	console.log('Calling "/disease" on the Node.js server.')
	var inputs = url.parse(request.url, true).query



	console.log('Current Risk Points:' + riskPoints)
})

// Returns risk category
app.get('/risk-category', (request, response) => {
	console.log('Calling "/risk-category" on the Node.js server.')
	if (riskPoints <= 20) {
		response.type('text/plain')
		response.send('Low Risk')
	}
	else if (riskPoints <= 50) {
		response.type('text/plain')
		response.send('Moderate Risk')
	}
	else if (riskPoints <= 75) {
		response.type('text/plain')
		response.send('High Risk')
	}
	else {
		response.type('text/plain')
		response.send('Uninsurable')
	}
})

// Test a variety of functions.
app.get('/test', (request, response) => {
    // Write the request to the log. 
    console.log(request);

    // Return HTML.
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<h3>Testing Function</h3>')

    // Access function from a separate JavaScript module.
    response.write("The date and time are currently: " + dt.myDateTime() + "<br><br>");

    // Show the full url from the request. 
    response.write("req.url="+request.url+"<br><br>");

    // Suggest adding something tl the url so that we can parse it. 
    response.write("Consider adding '/test?year=2017&month=July' to the URL.<br><br>");
    
	// Parse the query string for values that are being passed on the URL.
	var q = url.parse(request.url, true).query;
    var txt = q.year + " " + q.month;
    response.write("txt="+txt);

    // Close the response
    response.end('<h3>The End.</h3>');
});

// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
