/**
 * THIS IS A TEST FILE
 * Fill up the database with some random fake data.
 */

const Query = require('./query.js').Query;
const query = new Query();
const Database = require('./database.js').Database;
const db = new Database();

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
    promises.push(query.createRoom("room"+i, things).then(id => rooms.push(id)));
  }
  return Promise.all(promises);
}

/* SAMPLING */
function getSample(device) {
  if(!device) device = devices[randInt(0, devices.length - 1)];
  lastDate = new Date(lastDate.getTime() + randInt(30, 60) * 100);  // Add from 30 to 60 seconds
  const obj = {
    id: device.id,
    timestamp: lastDate.toLocaleString()
  };
  if (device.temp) obj['temp'] = randInt(15, 40);
  if (device.humidity) obj['humidity'] = randInt(30, 100);
  if (device.light) obj['light'] = randInt(5, 90);
  if (device.pir) obj['pir'] = randInt(0, 1);
  if (device.door) obj['door'] = randInt(0, 1);
  return obj;
}

function fillMeasures(measuresNumber) {
  measuresNumber = measuresNumber | 100;
  const promises = [];
  for (let i = 0; i < measuresNumber; i++)
    promises.push(Query.insertMeasure(getSample()));
  return Promise.all(promises);
}

/* DEFAULT DATA FOR TEST */
function addDefaultData(roomName, deviceMAC) {
  roomName = roomName ? roomName : "default_room";
  deviceMAC = deviceMAC ? deviceMAC : "00:00:00:00:00:00";
  const device = {
    id: deviceMAC,
    temp: 1,
    humidity: 1,
    light: 1,
    pir: 1,
    door: 1
  };
  devices.push(device);
  return query.createRoom(roomName, [device.id]).then(id => {
    rooms.push(id);
    return Query.insertMeasure(getSample(device));
  })
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
  for (const collection in db.collections)
    promises.push(Database.queryAll(db.collections[collection]).then(data => console.log(data)));
  return Promise.all(promises);
}

/* MAIN */
async function main () {
  await init();
  await fill();
  await addDefaultData();
  //await printDb();
  process.exit()
}
main();