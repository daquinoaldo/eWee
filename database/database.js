const MongoClient = require('mongodb').MongoClient;


// ----- ----- CONSTANTS AND GLOBALS ----- ----- //
const URL = "mongodb://localhost:27017/";
const DB_NAME = "envir_sensing";


// ----- ----- DATABASE OBJECT ----- ----- //
class Database {
  constructor() {

  }

  // ----- First order api ----- //
  /*
   * Promises to drop the database
   * @return: true on success, an error otherwise
   */
  dropPromise() {
    return new Promise((resolve, reject) => {
      this.mMongoDb.dropDatabase(function(err, result) {
        err ? reject(err) : resolve(true);
      });
    });
  }

  /*
   * Promises to connect to the database
   * @return: ?
   */
  connectPromise() {
    let thisbd = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(URL, function (err, db) {
        thisbd.mMongoDb = db.db(DB_NAME);
        err ? reject(err) : resolve(true);
      })
    });
  }

  /*
   * Promises to insert an object in a collection
   * @return: true if no error occurred, the error otherwise
   */
  insertPromise(collection, obj) {
    return new Promise((resolve, reject) => {
      this.mMongoDb.collection(collection).insertOne(obj, function (err, res) {
        err ? reject(err) : resolve(true);
      });
    });
  }

  /*
   * Promises to insert an object in a collection
   * @return: true if no error occurred, the error otherwise
   */
  getAllPromise(collection) {
    return new Promise((resolve, reject) => {
      this.mMongoDb.collection(collection).find({}).toArray(function(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }

  /*
   * Promises to get an object with
   * @return:
   */
  getSinglePromise(collection, query) {
    return new Promise((resolve, reject) => {
      this.mMongoDb.collection(collection).find(query).toArray(function(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }

  // ----- Second order api ----- //
  /*
   * Promises to insert an object in a collection
   * @return: true if no error occurred, the error otherwise
   */
  getSensorPromise(sensorId) {
    return getSinglePromise(sampleCollection, {device: sensorId});
  }

  /*
   * Promises to insert an object in a collection
   * @return: true if no error occurred, the error otherwise
   */
  static getRoomPromise(roomId) {
    return new Promise((resolve, reject) => {
      // TODO: tutto
    });
  }
}


// ----- ----- ESPORTS ----- ----- //
module.exports = {
  Database : Database,
  sampleCollection: "samples"
}
