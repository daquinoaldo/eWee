const collections = require('./database.js').collections;
const Db = require('./database.js').Database;
const db = new Db();

class Query {
  constructor() { }

  /**
   * Must be called before everything
   * @returns a promise
   */
  static init() {
    return db.connect();
  }

  /*******************
   *     INSERTS     *
   *******************/

  /**
   * Insert an obj in the database and return a promise
   * @param obj of type {id: <device_id>, timestamp: <timestamp>, temp: <int, in celsius>, humidity: <int in 0..100>,
       * light: <int in 0..100>, pir: <movement (boolean)>, door: <movement (boolean)>}
   * @returns Promise<any>
   */
  static insertMeasure(obj) {
    //TODO: add the room id
    if (!obj || typeof obj !== typeof {}) return new Promise((resolve, reject) => {
      reject("Error: you must specify the object to be inserted.");
    });
    return Db.insert(collections.measures, obj);
  }

  /**
   * Create a new room and return the id
   * @param name of the room
   * @param things, an array of devices in the room, can be null
   * @returns Promise<any> resolved with the id of the inserted room
   */
  createRoom(name, things) {
    return new Promise((resolve, reject) => {
      if (!name) reject("Error: the room must have a name.");
      things = (things && typeof things === typeof []) ? things : [];
      Db.insert(collections.rooms, {name: name, things: things}).then(res => resolve(res.insertedId.toString()));
    });
  }
  /*createRoom(name, things) {
    things = things | [];
    return new Promise((resolve, reject) => {
      db.query(collections.rooms, {name: name}).hasNext().then(res => {
        if (res) reject("Error: a room with name "+name+" already exists.");
        db.insert(collections.rooms, {name: name, things: []}).then(res => resolve(res.insertedId));
      });
    })
  }*/

  /*******************
   *     UPDATES     *
   *******************/

  // Low level function, NOT TESTED
  static updateRoom(id, newName, things) {
    const set = {};
    if (name) set.name = name;
    if (things) set.things = things;
    return Db.update(collections.rooms, id, {$set: set});
  }

  static bind(deviceID, roomID) {
    return Db.update(collections.rooms, roomID, {$addToSet: {things: deviceID}});
  }


  /*******************
   *     QUERIES     *
   *******************/

  /**
   * Return the last measure available in the database
   * @param sensorID, optional, the ID of the sensor
   * @param attribute, optional, specify that this attribute have to exist
   * @returns Promise<any> promise
   */
  static getLastMeasure(sensorID, attribute) {
    return new Promise((resolve, reject) => {
      const query = {};
      if (sensorID) query.id = sensorID;
      if (attribute) query[attribute] = { $exists: true };
      Db.query(collections.measures, query).sort({"timestamp": -1}).next()
        .then(measure => resolve(attribute ? measure[attribute] : measure))
        .catch(() => reject("Sensor with id "+sensorID+" doesn't exist"))
    })
  }

}

module.exports = {
  Query : Query
};