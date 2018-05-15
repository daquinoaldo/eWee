// const UUIDs = require('./UUIDs.js');
const database = require('./database.js');
let db = new database.Database();

class Query {
  constructor() { }

  /**
   * Must be called before everything
   * @returns a promise
   */
  init() {
    return db.connect();
  }

  /**
   * Insert an obj in the database and return a promise
   * @param obj of type {id: <device_id>, timestamp: <timestamp>, temp: <int, in celsius>, humidity: <int in 0..100>,
       * light: <int in 0..100>, pir: <movement (boolean)>, door: <movement (boolean)>}
   * @returns a promise
   */
  insertMeasure(obj) {
    //TODO: add the room id
    return db.insert(database.collection.measures, obj);
  }

  /**
   * Create a new room and return the id
   * @param name
   * @returns a promise resolved with the id of the inserted room or rejected if the room with this name already exists
   */
  addRoom(name) {
    return new Promise((resolve, reject) => {
      db.query(database.collection.rooms, {name: name}).hasNext().then(res => {
        if (res) reject("Error: a room with name "+name+" already exists.");
        db.insert(database.collection.rooms, {name: name, things: []}).then(res => resolve(res.insertedId));
      });
    })
  }

  /**
   * Return the last measure of a sensor
   * @param sensorID, optional, the ID of the sensor
   * @param attribute, optional, specify that this attribute have to exist
   * @returns a promise
   */
  getLastMeasure(sensorID, attribute) {
    const query = {};
    if (sensorID) query.id = sensorID;
    if (attribute) query[attribute] = { $exists: true };
    return db.query(database.collection.measures, query).sort({"timestamp": -1}).next();
  }
}

module.exports = {
  Query : Query
}
