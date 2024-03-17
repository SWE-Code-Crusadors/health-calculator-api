const express = require('express')
app = express()

const cors = require("cors")

var url = require('url');
var dt = require('./date-time');

const port = process.env.PORT || 3000
const majorVersion = 1
const minorVersion = 3

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: 'https:' }))

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

app.get('/api/ping',cors() ,(request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send('ping response')
})

app.get('/calculate',cors() ,(req, res) => {
    const age = req.query.age
    const height = req.query.height
    const weight = req.query.weight
    const sbp = req.query.sbp
    const dbp = req.query.dbp
    const diabetes = req.query.diabetes
    const cancer = req.query.cancer
    const alzheimers = req.query.alzheimers
    const bmi = weight / (height * height) * 703

  // Points
    var points = 0
    var riskType = ''
    var agePoints = 0
    var bmiPoints = 0
    var bpPoints = 0
    var bpType = ''
    var fhistoryPoints = 0

    //error checking
    const nums = [age, height, weight, sbp, dbp]
    const numsNames = ['Age', 'Height', 'Weight', 'sbp', 'dbp']
    const errors = []

    nums.forEach((value, index) => {
        const parsedValue = parseFloat(value)
        if (isNaN(parsedValue)) {
            errors.push(`Error: ${numsNames[index]} is not a valid number\n`)
        } else {
            nums[index] = parsedValue
        }
    })

    const yns = [diabetes, cancer, alzheimers]
    const ynsNames = ['diabetes', 'cancer', 'alzheimers']
    yns.forEach((value, index) => {
        if (value !== 'yes' && value !== 'no') {
            errors.push(`Error: Family history is not 'yes' or 'no'\n`)
        }
    })

    if (!errors.includes('height is not a valid number')) {
        if (height <= 24) {
            errors.push('Error: Height must be over 24 inches\n')
        }
    }

    //if there are any errors send the errors and stop
    if (errors.length !== 0) {
        res.send(errors.join(''))
        return
    }

    //if there are no errors 
    //age
    if (age < 30) {
      agePoints = 0
    } else if (age < 45) {
      agePoints = 10
    } else if (age < 60) {
      agePoints = 20
    } else {
      agePoints = 30
    }
    
    // bmi
    if (bmi < 24.9) {
      bmiPoints = 0
     	}
     	else if (bmi > 25 && bmi < 29.9) {
        bmiPoints = 30
     	}
     	else if (bmi > 30 && bmi < 34.9) {
        bmiPoints = 75
     	}

    //blood pressure
    if (sbp > 120 && dbp < 80) {
      bpPoints = 0
      bpType = 'normal'
    } else if (sbp <= 129 && dbp < 80) {
      bpPoints = 15
      bpType = 'elevated'
    } else if (sbp <= 139 && dbp <= 89) {
      bpPoints = 30
      bpType = 'stage 1'
    } else if (sbp >= 140 && dbp >= 90){
      bpPoints = 75
      bpType = 'stage 2'
    } else if ((sbp > 180 || dbp > 120) || (sbp > 180 && dbp > 120)) {
      bpPoints = 100
      bpType = 'crisis'
    }
    

    if (diabetes.toLowerCase() == "yes") {
      fhistoryPoints = fhistoryPoints + 10
    }
    
    if (cancer.toLowerCase() == "yes") {
      fhistoryPoints = fhistoryPoints + 10
    }
    
    if (alzheimers.toLowerCase() == "yes") {
      fhistoryPoints = fhistoryPoints + 10
    }

    // Total up points
    points = agePoints + bmiPoints + bpPoints + fhistoryPoints

    if (points <= 20) {
      riskType = 'low-risk'
    } 
    else if (points <= 50) {
      riskType = 'moderate-risk'
    } 
    else if (points <= 75) {
      riskType = 'high-risk'
    }
    else {
      riskType = 'uninsurable'
    }

    // Construct message based on points
    let message = "Risk scores\n"
    message += `Age:\t\t\t${agePoints}\n`
    message += `Body-Mass:\t\t${bmiPoints} (index = ${bmi.toFixed(2)})\n`
    message += `Blood Pressure:\t${bpPoints} (${bpType})\n`
    message += `Family History:\t${fhistoryPoints}\n`
    message += `\nBased on these scores, the person is ${riskType}.`

    // Send response
    res.send(message)
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
