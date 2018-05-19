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
  static createRoom(name, things) {
    return new Promise((resolve, reject) => {
      if (!name) reject("Error: the room must have a name.");
      things = (things && typeof things === typeof []) ? things : [];
      Db.insert(collections.rooms, {name: name, things: things}).then(res => resolve(res.insertedId.toString()));
    });
  }


  /*******************
   *     UPDATES     *
   *******************/

  /**
   * Bind a device to a room
   * @param deviceID
   * @param roomID
   * @returns Promise<any> with true if everything is gone ok
   */
  static bind(deviceID, roomID) {
    return new Promise((resolve, reject) => {
      Db.update(collections.rooms, roomID.toLowerCase(), {$addToSet: {things: deviceID.toLowerCase()}}).then(res => {
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
      Db.delete(collections.rooms, id.toLowerCase()).then(res => {
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
      Db.update(collections.rooms, roomID.toLowerCase(), {$pull: {things: deviceID.toLowerCase()}}).then(res => {
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
      if (sensorID) query.id = sensorID.toLowerCase();
      if (attribute) query[attribute] = { $exists: true };
      Db.query(collections.measures, query).sort({"timestamp": -1}).next()
        .then(measure => resolve(attribute ? measure[attribute] : measure))
        .catch(() => reject("Sensor with id "+sensorID+" doesn't exist."))
    })
  }

  /**
   * Return the status of a room
   * @param roomID
   * @param attribute, optional, specify the attribute that you want to know
   * @returns Promise<any> promise
   */
  static getRoomStatus(roomID, attribute) {
    return new Promise((resolve, reject) => {
      if (!roomID) reject("You must specify the room id.");
      const query = {
        _id: roomID
      };
      if (attribute) query[attribute] = { $exists: true };
      Db.query(collections.status, query).sort({"timestamp": -1}).next()
        .then(status => resolve(attribute ? status[attribute] : status))
        .catch(() => reject("Room with id "+roomID+" doesn't exist."))
    })
  }

  /**
   * Return the details of all the rooms (or of a specific room)
   * @param roomID, option, the specific room
   * @returns Promise<any> promise
   */
  static getRoomDetails(roomID) {
    return new Promise((resolve, reject) => {
      if (!roomID) return Query.getRoomsList();
      Db.query(collections.rooms, {_id: roomID}).next()
        .then(room => resolve(room))
        .catch(() => reject("Room with id "+roomID+" doesn't exist."))
    });
  }

  /**
   * Return both status and details of a room in one single object
   * @param roomID
   * @returns Promise<any> promise
   */
  static getRoom(roomID) {
    const room = {};
    return new Promise(async (resolve, reject) => {
      const promises = [];
      promises.push(
        Query.getRoomStatus(roomID)
          .then(status => {
            for (const key in status)
              room[key] = status[key];
          })
      );

      promises.push(
        Query.getRoomDetails(roomID)
          .then(details => {
            for (const key in details)
              room[key] = details[key];
          })
      );
      await Promise.all(promises).then(resolve).catch(err => reject(err));
    });
  }

  /**
   * Return the list of all the rooms in the house and theirs sensors
   * @returns Promise<any>
   */
  static getRoomsList() {
    return new Promise((resolve, reject) => {
      Db.query(collections.rooms, {}).toArray()
        .then(list => resolve(list))
        .catch(() => reject("Unknown error."))
    });
  }

}

module.exports = {
  Query : Query
};