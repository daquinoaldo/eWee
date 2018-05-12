// ----- ----- TESTING FUNCTIONS ----- ----- //
const db = require('./database.js');
let gDatabase = new db.Database();

// An array of testing sensors ids
let sensorMac = [
  'sampler_12345',
  'sampler_00001',
  'sampler_00002',
  'sampler_00003',
  'sampler_00004'
];

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Available characteristics
let charUUID = {
  '2AC5' : () => { return getRandomInt(0, 1); },   // PIR
  '2A1F' : () => { return getRandomInt(20, 30); }, // Temperature Celsius
  '2A6F' : () => { return getRandomInt(20, 30); }, // Humidity
  '0000' : () => { return getRandomInt(0, 1); },   // Door sensor
  '2A77' : () => { return getRandomInt(0, 42); },  // Irradiance
  '0001' : () => { return getRandomInt(0, 1); }    // ??? ¯\_(ツ)_/¯
}

/**
 * Generates a random sample from sensor with id taken from 'sensorIds'
 *   and characteristic values taken from 'charUUID'
 * @note: there is a small chance that some measure fail to be read
 */
let randomSens = function () {
  let mac = sensorMac[getRandomInt(0, sensorMac.length-1)];

  let entry = { 'device': mac };
  for (const uuid in charUUID) {
    if (Math.random() < 0.9) {
      entry[uuid] = charUUID[uuid]();
    } // Adding a small chance of getting no sample for that uuid
  } // Iterating for all the available characteristic

  return entry;
};

/*
 * Rise up the database
 * @param x: the number of entry to insert
 */
let Atlante = function(x) {
  return new Promise(async (resolve, reject) => {
    for (let i=0; i<x; i++) {
      let r = randomSens();
      await gDatabase.insertPromise(db.sampleCollection, r);

    }
    resolve(true);
  });
}

let main = async function () {
  // Connecting
  let res = await gDatabase.connectPromise();
  // Cleaning
  await gDatabase.dropPromise();
  // Rising up
  await Atlante(10);
  // Getting all samples
  let dbData = await gDatabase.getAllPromise(db.sampleCollection);
  console.log(dbData);
}();
