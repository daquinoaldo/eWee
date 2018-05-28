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
   * @param action of type {id: <device_id>, timestamp: <timestamp>, key: <value>}
   * @returns Promise<any>
   */
  static insertAction(action) {
    return new Promise((resolve, reject) => {
      if (!action || typeof action !== typeof {}) reject("Error: you must specify the object to be inserted.");
      if (!action.id) reject("Error: the object must have the field id containing the MAC address of the device.");
      if (!action.timestamp) reject("Error: the object must have the field timestamp.");
      Db.queryLast(collections.rooms, {things: action.id}).then(room => {
        action.room = room ? room._id : null;
        Db.insert(collections.actions, action).then(() => resolve("ok"));
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
      if (!name) reject("The room must have a name.");
      things = (things && typeof things === typeof []) ? things : [];
      Db.insert(collections.rooms, {name: name, things: things}).then(res => resolve(res.insertedId.toString()));
    });
  }

  /**
   * Specify a new policy for a room
   * @param room
   * @param policy for the room
   * @returns Promise<any> resolved with the id of the inserted room
   */
  static setPolicy(room, policy) {
    return new Promise((resolve, reject) => {
      if (!room) reject("Policy must refer to a room.");
      if (!policy) reject("You must specify a policy.");
      Db.updateWithQuery(collections.policy, {room: policy.room}, policy).then(res => resolve(true));
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
      if (!newName) reject("You must specify the name of the room.");
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
    return new Promise(async (resolve, reject) => {
      if (!deviceID) reject("You must specify the id of the device.");
      if (!roomID) reject("You must specify the id of the room.");
      // successfully unbinds the device, or device not previously bounded
      try {
        await Query.unbind(deviceID);
      } catch(err) { }
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
  static unbindFromRoom(deviceID, roomID) {
    return new Promise((resolve, reject) => {
      if (!deviceID) reject("You must specify the id of the device.");
      if (!roomID) reject("You must specify the id of the room.");
      Db.update(collections.rooms, roomID.toLowerCase(), {$pull: {things: deviceID.toLowerCase()}}).then(res => {
        if (!res.result.ok) reject("Unknown error.");
        resolve(!!+res.result.n); // cast the number of updated docs to int (+) and then to boolean (!!)
      });
    });
  }

  /**
   * Unbind a device from a room
   * @param deviceID
   * @param roomID, optional, if you know the room
   * @returns Promise<any> with true if everything is gone ok
   */
  static unbind(deviceID, roomID) {
    if (roomID) return Query.unbindFromRoom(deviceID, roomID);
    return new Promise((resolve, reject) => {
      if (!deviceID) reject("You must specify the id of the device.");
      let n = 0;
      const promises = [];
      Query.getRoomsList().then(async list => {
        if (!list || !list.length) reject("There are no rooms in the house, so the device cannot be bound.");
        for (let i = 0; i < list.length; i++) {
          const roomID = list[i]._id;
          promises.push(
            Db.update(collections.rooms, roomID, {$pull: {things: deviceID.toLowerCase()}}).then(res => {
              if (!res.result.ok) reject("Unknown error.");
              n += +res.result.n; // cast the number of updated docs to int (+) and then to boolean (!!)
            })
          );
        }
        await Promise.all(promises).then(() => resolve(!!+n)).catch(err => reject(err));
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
        .catch(err => {
          console.error(err);
          reject("Sensor with id "+sensorID+" doesn't exist.")
        })
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
        room: ObjectID(roomID)
      };
      if (attribute) query[attribute] = { $exists: true };
      Db.queryLast(collections.status, query)
        .then(status => resolve(attribute ? status[attribute] : status))
        .catch(err => {
          console.error(err);
          reject("Room with id "+roomID+" doesn't exist.")
        })
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
        .catch(err => {
          console.error(err);
          reject("Room with id "+roomID+" doesn't exist.")
        })
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
        .then(list => resolve(list))
        .catch(err => {
          console.error(err);
          reject("Unknown error.")
        })
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
        .catch(err => {
          console.error(err);
          reject("Unknown error.")
        })
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
        .catch(err => {
          console.error(err);
          reject("Unknown error.")
        })
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

  /**
   * Return a list of actions inserted after a given timestamp
   * @param timestamp
   * @returns Promise<any>
   */
  static getActions(timestamp) {
    return new Promise((resolve, reject) => {
      if(!timestamp) reject("You must specify a timestamp");
      const query = {
        timestamp: { $gte: timestamp }
      };
      Db.query(collections.actions, query).sort({"timestamp": 1}).toArray()
        .then(actions => resolve(actions))
        .catch(err => {
          console.error(err);
          reject("Unknown error.")
        })
    })
  }

  /**
   * Return the policy of all the rooms (or of a specific room)
   * @param roomID, optional, the specific room
   * @returns Promise<any> promise
   */
  static getPolicy(roomID) {
    return new Promise((resolve, reject) => {
      if (!roomID) reject("You must specify the room.");
      Db.queryLast(collections.policy, {_id: ObjectID(roomID)})
        .then(policy => resolve(policy))
        .catch(err => {
          console.error(err);
          reject("A policy for the room "+roomID+" doesn't exist.")
        })
    });
  }

  /**
   * Return the statistic statistic of a specific room in a specific day
   * @param roomID the specific room
   * @param yyyy the year
   * @param mm the month
   * @param dd the day
   * @returns Promise<any> promise with an object with this format: { characteristic1: [<value1>, ..., <value24>],
   * characteristic2: [...values], ... }.
   * Note that if you pick the current day you may have less than 24 values in the arrays.
   */
  static getStats(roomID, yyyy, mm, dd) {
    return new Promise((resolve, reject) => {
      if (!roomID) reject("You must specify the room.");
      if (!yyyy) reject("You must specify an year.");
      if (!mm) reject("You must specify a month.");
      if (!dd) reject("You must specify a day.");
      const query = {
        room: ObjectID(roomID),
        year: +yyyy,
        month: +mm,
        day: +dd
      };
      Db.query(collections.statistics, query).sort({"hour": 1}).toArray()
        .then(res => {
          const exclude = ["_id", "year", "month", "day", "room"];
          const statistics = {};
          statistics.room = res[0].room;
          statistics.year = res[0].year;
          statistics.month = res[0].month;
          statistics.day = res[0].day;
          for (let i = 0; i < res.length; i++)
            for (const key in res[i])
              if (!exclude.includes(key)) {
                if (!statistics.hasOwnProperty(key)) statistics[key] = [];
                statistics[key][i] = res[i][key];
              }
          resolve(statistics);
        })
        .catch(err => {
          console.error(err);
          reject("A policy for the room "+roomID+" doesn't exist.");
        })
    });
  }

}

module.exports = {
  Query : Query
};