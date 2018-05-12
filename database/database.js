const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const dbname = "envir_sensing";

let db;


// ----- ----- FS ORDER API ----- ----- //
/*
 * Promises to drop the database
 * @return: true on success, an error otherwise
 */
function mongoDropPromise() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
          if (err) reject(err);
          db.dropDatabase(function(err, result){
            err ? reject(err) : resolve(true);
          });
        });
    });
}

/*
 * Promises to connect to the database
 * @return: ?
 */
function mongoConnectionPromise() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            err ? reject(err) : resolve(db.db(dbname));
        })
    })
}

/*
 * Promises to insert an object in a collection
 * @return: true if no error occurred, the error otherwise
 */
function insertPromise(collection, obj) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(obj, function (err, res) {
            err ? reject(err) : resolve(true);
        });
    });
}

/*
 * Promises to insert an object in a collection
 * @return: true if no error occurred, the error otherwise
 */
function getSensorPromise(sensorId) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(obj, function (err, res) {
            err ? reject(err) : resolve(true);
        });
    });
}

/*
 * Promises to insert an object in a collection
 * @return: true if no error occurred, the error otherwise
 */
function getRoomPromise(roomId) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(obj, function (err, res) {
            err ? reject(err) : resolve(true);
        });
    });
}


// ----- ----- TESTING FUNCTIONS ----- ----- //
// An array of testing sensors ids
let sensorIds = [
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
  let id = charUUID[getRandomInt(0, charUUID.length)];
  let entry = { 'device': id };
  for (uuid in charUUID) {
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
let Atlante = async function(x) {
  await mongoDropPromise();

  for (int i=0; i<x; x++) {
    let r = randomSens();
    await insertPromise(r);
  }
}

async function main() {
  db = await connect();
  const testObj = {
      id: 1,
      temp: 18,
      humid: 88
  };

  if(await insert("prova", testObj) === true) console.log("Funge");
}

main();
