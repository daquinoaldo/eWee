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


  /*******************
   *     UPDATES     *
   *******************/

  // TODO: Low level function, NOT TESTED
  static updateRoom(id, newName, things) {
    const set = {};
    if (name) set.name = name;
    if (things) set.things = things;
    return Db.update(collections.rooms, id, {$set: set});
  }

  /**
   * Bind a device to a room
   * @param deviceID
   * @param roomID
   * @returns Promise<any> with true if everything is gone ok
   */
  static bind(deviceID, roomID) {
    return new Promise((resolve, reject) => {
      Db.update(collections.rooms, roomID, {$addToSet: {things: deviceID}}).then(res => {
        if (!res.result.ok) reject("Unknown error.");
        resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
      });
    });
  }


  /*******************
   *     DELETES     *
   *******************/

  /**
   * Delete a room
   * @param id of the room to be deleted
   * @returns Promise<any> with true if deleted
   */
  static deleteRoom(id) {
    return new Promise((resolve, reject) => {
      Db.delete(collections.rooms, id).then(res => {
        if (!res.result.ok) reject("Unknown error.");
        resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
      });
    });
  }

  /**
   * Unbind a device from a room
   * @param deviceID
   * @param roomID
   * @returns Promise<any> with true if everything is gone ok
   */
  static unbind(deviceID, roomID) {
    return new Promise((resolve, reject) => {
      Db.update(collections.rooms, roomID, {$pull: {things: deviceID}}).then(res => {
        if (!res.result.ok) reject("Unknown error.");
        resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
      });
    });
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