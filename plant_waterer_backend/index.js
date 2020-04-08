const gpio = require('pigpio').Gpio;
const sensor = require('node-dht-sensor');
const i2cBase = require('raspi-i2c').I2C;
const ads1x15 = require('raspi-kit-ads1x15');
const express = require('express');
const cors = require('cors');
const fs = require('fs');



/*
  SECTION: Constants
  Sets various constants for the program
*/
const DHT11PIN = 22;
const MOTORPIN = 17;
const SOILSENSORPIN = 3;
const SERVERPORT = 3000;
const MAXFILESIZE = 500;
const ACTIVATEMOTORTIME = 1;
const SENSORTEXTFILEBASE = "plantsensorlogs";
const MOTORTEXTFILEBASE = "motorlogs";


/*
  SECTION: Hardware Setup
  Defines various functions to get data from and manipulate the raspberry pi
*/
// This is to get the data from the DHT11 sensor
const getTempAndHum = async () => {
	let returnVal = await new Promise(resolve => {
		sensor.read(11, DHT11PIN, function(err, temp, hum) {
			temp = temp * (9/5) + 32;
			if (!err) {
				let toReturn = {};
				toReturn.temperature = Math.round(temp);
				toReturn.humidity = Math.round(hum);
				resolve(toReturn);

			}
		});
	});
	return returnVal;
}

//This is to control the motor
const motor = new gpio(MOTORPIN, {mode: gpio.OUTPUT});

// Accepts how long, in seconds, to turn on the motor for
const activateMotor = (time) => {
	motor.digitalWrite(1);
	logMotorRun();
}


// This is to get the data from the capacitiative soil sensor

const i2c = new i2cBase();
const soilSensor = new ads1x15({
	i2c,
	chip: ads1x15.chips.IC_ADS1115,
	address: ads1x15.address.ADDRESS_0x48,

	pga: ads1x15.pga.PGA_4_096V,
	sps: ads1x15.spsADS1115.SPS_250
})
const readSoilSensor = async () => {
	let returnVal = await new Promise(resolve => {
		soilSensor.readChannel(ads1x15.channel.CHANNEL_0, (err, val, vol) => {
			if (!err) {
				// Returns the value of the sensor as a % of the max value
				val = Math.round((val/65535) * 100);
				// Returns the inverse of the sensor value,
				// since the original value
				//  gets lower with more moisture
				resolve(100-val);
			}
		});
	});
	return returnVal;
}



/*
  SECTION: Text File
  This is to handle reading and writing to the files
*/

// How often to log sensor data, in seconds
let sensorLogInterval = 3;
// The incrementers to dynamically generate new files (to avoid
// reading in too much data at once)
let sensorFileNumber = 1;
let motorFileNumber = 1;
// Represent how many records are in the current file
let sensorFileCount = 0;
let motorFileCount = 0;

// Accenpts the muber of reords desired and returns the given number of records or the
// total number of stored records or # of records demanded, whichever is lower
const getPastRecords = (type, num) => {
	let currentFile = (type === 'motor' ? motorFileNumber : sensorFileNumber);
	let fileName = (type === 'motor' ? MOTORTEXTFILEBASE : SENSORTEXTFILEBASE);

	const pastSensorRecordsHelper = (fileNum, numRecords) => {
		let subRecords = fs.readFileSync(fileName + fileNum + ".txt", {encoding: "utf-8"}).split("\n");
		subRecords.pop();
		subRecords.reverse();
		if (subRecords.length < num && fileNum > 1) {
			newFile = --fileNum;
			newNumRecords = numRecords - subRecords.length;
			return subRecords.concat(pastSensorRecordsHelper(newFile, newNumRecords));
		} else {
			return subRecords.slice(0, numRecords);
		}

	}

	if (isNaN(num)) {
		return [];
	} else {
		let records =  pastSensorRecordsHelper(currentFile, num);
		return records;
	}
}

// Called when the motor is run to log the date of the run time to the text file
const logMotorRun = () => {
	fs.appendFile(`${MOTORTEXTFILEBASE}${motorFileNumber}.txt`,
	`{"date": "${new Date()}"}\n`,
	() => {})
}

// When called, will start logging sensor data at the given interval
const sensorRecorder = () => {
	setInterval(() => {
		Promise.all([getTempAndHum(), readSoilSensor()])
			.then((values) => {
				fs.appendFile(`${SENSORTEXTFILEBASE}${sensorFileNumber}.txt`,
				`{"date": "${new Date()}", "temperature": "${values[0].temperature}", "humidity": "${values[0].humidity}", "moisture": "${values[1]}"}\n`,
				() => {});
			})
	}, sensorLogInterval * 1000)
}



/*
  SECTION: Logic
  Watering logic, if not present in the other sections
*/

// At what moisture %, if gone below, to activate the watering system
let moistureThreshold = 70;

// Loop which will water the plant below the given threshold

setInterval(() => {
	readSoilSensor().then(moisture => {
		if (moisture <= moistureThreshold && motor.digitalRead() === 0) {
			activateMotor(ACTIVATEMOTORTIME);
		}
		if (moisture >= moistureThreshold && motor.digitalRead() === 1) {
			motor.digitalWrite(0);
		}
	})
}, 2000);

sensorRecorder();




/*
  SECTION: Server
  This sets up the server and its routes
*/
const app = express();
app.use(express.json());
app.use(cors());

app.get('/temperature', (req, res) => {
	getTempAndHum().then(val => res.send({ temperature: val.temperature }));
})

app.get('/humidity', (req, res) => {
	getTempAndHum().then(val => res.send({ humidity: val.humidity }));
})

app.get('/moisture', (req, res) => {
	readSoilSensor().then(val => res.send({ moisture: val  }));
})

app.get('/historical-sensor-data', (req, res) => {
	res.send({ data: getPastRecords('sensor', req.query.quantity) });
})

app.get('/historical-motor-data', (req, res) => {
	res.send({ data: getPastRecords('motor', req.query.quantity) });
})

app.get('/moisture-threshold', (req, res) => {
	res.send({ data: moistureThreshold });
})

app.post('/moisture-threshold', (req, res) => {
	moistureThreshold = req.body.newVal;
})



app.listen(SERVERPORT);
