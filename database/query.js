const collections = require('./database.js').collections;
const Db = require('./database.js').Database;
const db = new Db();
const ObjectID = require('mongodb').ObjectID;

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
   * Insert a measure in the database and return a promise
   * @param measure of type {id: <device_id>, timestamp: <timestamp>, temp: <int, in celsius>, humidity: <int in 0..100>,
       * light: <int in 0..100>, pir: <movement (boolean)>, door: <movement (boolean)>}
   * @returns Promise<any>
   */
  static insertMeasure(measure) {
    return new Promise((resolve, reject) => {
      if (!measure || typeof measure !== typeof {}) reject("Error: you must specify the object to be inserted.");
      if (!measure.id) reject("Error: the object must have the field id containing the MAC address of the device.");
      if (!measure.timestamp) reject("Error: the object must have the field timestamp.");
      measure.id = measure.id.toLowerCase();
      Db.queryLast(collections.rooms, {things: measure.id}).then(room => {
        measure.room = room ? room._id : null;
        Db.insert(collections.measures, measure).then(() => resolve("ok"));
      });
    });
  }

  /**
   * Insert an action in the database and return a promise
   * @param action of type {id: <device_id>, timestamp: <timestamp>, temp: <int, in celsius>, humidity: <int in 0..100>,
       * light: <int in 0..100>, pir: <movement (boolean)>, door: <movement (boolean)>}
   * @returns Promise<any>
   */
  static insertAction(action) {
    return new Promise((resolve, reject) => {
      if (!action || typeof action !== typeof {}) reject("Error: you must specify the object to be inserted.");
      if (!action.id) reject("Error: the object must have the field id containing the MAC address of the device.");
      if (!action.timestamp) reject("Error: the object must have the field timestamp.");
      Db.queryLast(collections.rooms, {things: action.id}).then(room => {
        action.room = room ? room._id : null;
        Db.insert(collections.measures, action).then(() => resolve("ok"));
      });
    });
  }

  /**
   * Insert an action in the database and return a promise
   * @param actuatorID, the ID o the device that should do the action
   * @param key that you want to assign, e.g. "status"
   * @param value that you want to assign to that key, e.g. "on"
   * @returns Promise<any>
   */
  static setKey(actuatorID, key, value) {
    const action = {
      id: actuatorID,
      timestamp: new Date(),
      agent: "user"
    };
    action[key] = value;
    return Query.insertAction(action);
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
   * Rename a room
   * @param id of the room
   * @param newName of the room
   * @returns {*}
   */
  static updateRoom(id, newName) {
    return new Promise((resolve, reject) => {
      if (!id) reject("You must specify the id of the room.");
      if (!name) reject("You must specify the name of the room.");
      Db.update(collections.rooms, id, {$set: {name: newName}}).then(res => {
        if (!res.result.ok) reject("Unknown error.");
          resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
      });
    });
  }

  /**
   * Bind a device to a room
   * @param deviceID
   * @param roomID
   * @returns Promise<any> with true if everything is gone ok
   */
  static bind(deviceID, roomID) {
    return new Promise((resolve, reject) => {
      if (!deviceID) reject("You must specify the id of the device.");
      if (!roomID) reject("You must specify the id of the room.");
      Db.update(collections.rooms, roomID.toLowerCase(), {$addToSet: {things: deviceID.toLowerCase()}}).then(res => {
        if (!res.result.ok) reject("Unknown error.");
        // delete all measures that this sensor made when were not in a room.
        // This is because we use measures with room null to discover unbound devices.
        Db.deleteWithQuery(collections.measures, {id: deviceID, room: null}).then(res => {
          if (!res.result.ok) reject("Unknown error.");
          resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
        });
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
      if (!id) reject("You must specify the id of the room.");
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
      if (!deviceID) reject("You must specify the id of the device.");
      if (!roomID) reject("You must specify the id of the room.");
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
      Db.queryLast(collections.measures, query)
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
        room: roomID
      };
      if (attribute) query[attribute] = { $exists: true };
      Db.queryLast(collections.status, query)
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
      Db.queryLast(collections.rooms, {_id: ObjectID(roomID)})
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
    return new Promise(async (resolve, reject) => {
      const room = {};
      const promises = [];
      promises.push(
        Query.getRoomStatus(roomID)
          .then(status => {
            for (const key in status)
              if(key !== "room") room[key] = status[key];
          })
      );

      promises.push(
        Query.getRoomDetails(roomID)
          .then(details => {
            for (const key in details)
              room[key] = details[key];
          })
      );
      await Promise.all(promises).then(() => resolve(room)).catch(err => reject(err));
    });
  }

  /**
   * Return the list of all the rooms in the house and theirs sensors
   * @returns Promise<any>
   */
  static getRoomsList(excludeSensorsList) {
    return new Promise((resolve, reject) => {
      const options = {};
      if (excludeSensorsList) options.fields = {things: 0};
      Db.queryWithOptions(collections.rooms, {}, options).toArray()
        .then(list => {
          resolve(list)
          //delete myObject.regex;
        })
        .catch(() => reject("Unknown error."))
    });
  }

  /**
   * Return the devices list
   * @returns Promise<any> promise
   */
  static getDevicesList(unboundOnly) {
    return new Promise((resolve, reject) => {
      const query = {};
      if (unboundOnly) query.room = null;
      Db.queryDistinct(collections.measures, "id", query)
        .then(list => resolve(list))
        .catch(() => reject("Unknown error."))
    });
  }

  /**
   * Return the unbound devices list
   * @returns Promise<any> promise
   */
  static getUnboundDevices() {
    return Query.getDevicesList(true);
  }

  /**
   * Return the details of the house
   * @returns Promise<any> promise
   */
  static getHomeDetails() {
    return new Promise(async (resolve, reject) => {
      const home = {};
      const promises = [];
      promises.push(
        Query.getRoomsList(true).then(list => home.rooms = list)
      );
      promises.push(
        Query.getUnboundDevices().then(unboundDevices => home.unboundDevices = unboundDevices)
      );
      await Promise.all(promises).then(() => resolve(home)).catch(err => reject(err));
    });
  }

  /**
   * Return the status of the house
   * @param attribute, optional, specify the attribute that you want to know
   * @returns Promise<any> promise
   */
  static getHomeStatus(attribute) {
    return new Promise((resolve, reject) => {
      const query = {};
      Db.query(collections.status, query).toArray()
        .then(statuses => {
          const home = {
            timestamp: -1,
            occupied: false,
            temp: 0,
            humidity: 0,
            light: 0
          };
          //let [cTemp, cHumidity, cLight] = [0, 0, 0];
          let cTemp = 0;
          let cHumidity = 0;
          let cLight = 0;
          for (let i = 0; i < statuses.length; i++) {
            const status = statuses[i];
            home.timestamp = Math.max(home.timestamp, status.timestamp);  //TODO
            if (status.occupied) home.occupied = true;
            if (status.temp) {
              home.temp += status.temp;
              cTemp++;
            }
            if (status.humidity) {
              home.humidity += status.humidity;
              cHumidity++;
            }
            if (status.light) {
              home.light += status.light;
              cLight++;
            }
          }
          home.temp /= cTemp;
          home.humidity /= cHumidity;
          home.light /= cLight;
          resolve(attribute ? home[attribute] : home)
        })
        .catch(() => reject("Unknown error."))
    })
  }

  /**
   * Return both status and details of the house
   * @returns Promise<any> promise
   */
  static getHome() {
    return new Promise(async (resolve, reject) => {
      const home = {};
      const promises = [];
      promises.push(
        Query.getHomeStatus()
          .then(status => {
            for (const key in status)
              home[key] = status[key];
          })
      );

      promises.push(
        Query.getHomeDetails()
          .then(details => {
            for (const key in details)
              home[key] = details[key];
          })
      );
      await Promise.all(promises).then(() => resolve(home)).catch(err => reject(err));
    });
  }

}

module.exports = {
  Query : Query
};