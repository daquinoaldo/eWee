const database = require('./database.js');
let db = new database.Database();

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
   * @returns a promise
   */
  insertMeasure(obj) {
    //TODO: add the room id
    if (!obj || typeof obj !== typeof {}) return new Promise((resolve, reject) => {
      reject("Error: a room with name "+name+" already exists.");
    });
    return Database.insert(database.collection.measures, obj);
  }

  /**
   * Create a new room and return the id
   * @param name of the room
   * @param things, an array of devices in the room, can be null
   * @returns a promise resolved with the id of the inserted room or rejected if the room with this name already exists
   */
  addRoom(name, things) {
    return new Promise((resolve, reject) => {
      if (!name) reject("Error: a room with name "+name+" already exists.");
      things = (things && typeof things === typeof []) ? things : [];
      Database.insert(database.collection.rooms, {name: name, things: things}).then(res => resolve(res.insertedId.toString()));
    });
  }
  /*addRoom(name, things) {
    things = things | [];
    return new Promise((resolve, reject) => {
      db.query(database.collection.rooms, {name: name}).hasNext().then(res => {
        if (res) reject("Error: a room with name "+name+" already exists.");
        db.insert(database.collection.rooms, {name: name, things: []}).then(res => resolve(res.insertedId));
      });
    })
  }*/

  /*******************
   *     UPDATES     *
   *******************/

  updateRoom(id, name, things) {
    return new Promise((resolve, reject) => {
      Database.query(database.collection.rooms, {_id: id}).next().then(res => {
        if (res) reject("Error: a room with name "+name+" already exists.");
        Database.insert(database.collection.rooms, {name: name, things: []}).then(res => resolve(res.insertedId));
      });
    })
  }

  /*******************
   *     QUERIES     *
   *******************/

  /**
   * Return the last measure available in the database
   * @param sensorID, optional, the ID of the sensor
   * @param attribute, optional, specify that this attribute have to exist
   * @returns a promise
   */
  static getLastMeasure(sensorID, attribute) {
    const query = {};
    if (sensorID) query.id = sensorID;
    if (attribute) query[attribute] = { $exists: true };
    return Database.query(database.collection.measures, query).sort({"timestamp": -1}).next();
  }
}

module.exports = {
  Query : Query
}
