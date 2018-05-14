const Query = require('./query.js').Query;
const query = new Query();
const Database = require('./database.js').Database;
let db = new Database();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

const mac_addresses = [];
for (let i = randInt(3, 10); i > 0; i--)
  mac_addresses.push(randMAC());

let lastDate = new Date();

function getExampleObj() {
  lastDate = new Date(lastDate.getTime() + randInt(30, 60) * 100)  // Add from 30 to 60 seconds
  const obj = {
    id: mac_addresses[randInt(0, mac_addresses.length -1)],
    timestamp: lastDate.toLocaleString()
  };
  if (randInt(0, 1)) obj['temp'] = randInt(15, 40);
  if (randInt(0, 1)) obj['humidity'] = randInt(30, 100);
  if (randInt(0, 1)) obj['light'] = randInt(5, 90);
  if (randInt(0, 1)) obj['pir'] = randInt(0, 1);
  if (randInt(0, 1)) obj['door'] = randInt(0, 1);
  // TODO: MQ135
  return obj;
  /*return {
    id: mac_addresses[randInt(0, mac_addresses.length -1)],
    timestamp: lastDate.toLocaleString(),
    temp: randInt(15, 40),
    humidity: randInt(30, 100),
    light: randInt(5, 90),
    pir: randInt(0, 1),
    door: randInt(0, 1)
    // TODO: MQ135
  };*/
}

// noinspection JSUnusedLocalSymbols
let main = async function () {
  // Clear and init
  await db.connect();
  await db.drop();
  await db.disconnect();
  await query.init();

  // Insert some measurement in a variable number
  const measures = [];
  for (let i = randInt(mac_addresses.length * 2, mac_addresses.length * 7); i > 0; i--)
    measures.push(getExampleObj());
  const promises = [];
  for (let i = 0; i < measures.length; i++)
    promises.push(query.insertMeasure(measures[i]));
  await Promise.all(promises);

  // Get last measure of a device
  await query.getLastMeasure(measures[randInt(0, measures.length - 1)].id).then(res => console.log(res));
  process.exit();
}();