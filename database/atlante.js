/**
 * THIS IS A TEST FILE
 * Fill up the database with some random fake data.
 */

const Query = require('./query.js').Query;
const query = new Query();
const Database = require('./database.js').Database;
let db = new Database();

/* LOCAL STRUCTS and VARIABLES */
const rooms = [];
const devices = [];
let lastDate = new Date();

/* AUXILIAR FUNCTIONS */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// returns true a times on b
function probability(a, b) {
  return randInt(1, b) <= a;
}

/* DEVICES CREATION */
function randMAC(){
  const hexDigits = "0123456789ABCDEF";
  let macAddress = "";
  for (let i = 0; i < 6; i++) {
    macAddress+=hexDigits.charAt(randInt(0, 15));
    macAddress+=hexDigits.charAt(randInt(0, 15));
    if (i !== 5) macAddress += ":";
  }
  return macAddress;
}

function prepareRooms(roomsNumber, sensorsInRoom) {
  roomsNumber = roomsNumber | 4;
  sensorsInRoom = sensorsInRoom | 2;
  const promises = [];
  for (let i = 0; i < roomsNumber; i++) {
    const things = [];
    for (let j = 0; j < sensorsInRoom; j++) {
      // Assign a MAC address and decide randomly which sensors have
      const a = 3;
      const b = 5;
      const device = {
        id: randMAC(),
        temp: probability(a, b),
        humidity: probability(a, b),
        light: probability(a, b),
        pir: probability(a, b),
        door: probability(a, b)
      };
      things.push(device.id);
      devices.push(device);
    }
    promises.push(query.addRoom("room"+1, things).then(id => rooms.push(id)));
  }
  return Promise.all(promises);
}

/* SAMPLING */
function getSample(deviceId) {
  deviceId = deviceId | devices[randInt(0, devices.length)].id;
  lastDate = new Date(lastDate.getTime() + randInt(30, 60) * 100);  // Add from 30 to 60 seconds
  const obj = {
    id: deviceId.id,
    timestamp: lastDate.toLocaleString()
  };
  if (deviceId.temp) obj['temp'] = randInt(15, 40);
  if (deviceId.humidity) obj['humidity'] = randInt(30, 100);
  if (deviceId.light) obj['light'] = randInt(5, 90);
  if (deviceId.pir) obj['pir'] = randInt(0, 1);
  if (deviceId.door) obj['door'] = randInt(0, 1);
  return obj;
}

function fillMeasures(measuresNumber) {
  measuresNumber = measuresNumber | 100;
  const promises = [];
  for (let i = 0; i < measuresNumber; i++)
    promises.push(query.insertMeasure(getSample()));
  return Promise.all(promises);
}

/* HIGH LEVEL FUNCTIONS */
async function init() {
  // Clear and init
  await db.connect();
  await Database.drop();
  await Database.disconnect();
  await Query.init();
}

function fill() {
  const promises = [];
  promises.push(prepareRooms());
  promises.push(fillMeasures());
  return Promise.all(promises);
}

function printDb() {
  const promises = [];
  for (const collection in db.collection)
    promises.push(Database.queryAll(db.collection[collection]).then(data => console.log(data)));
  return Promise.all(promises);
}

/* MAIN */
async function main () {
  await init();
  await fill();
  //await printDb();
}

// Run main then exit
main().then(process.exit());