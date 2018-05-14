const MongoClient = require('mongodb').MongoClient;


// ----- ----- CONSTANTS AND GLOBALS ----- ----- //
const URL = "mongodb://localhost:27017/";
const DB_NAME = "envir_sensing";


// ----- ----- DATABASE OBJECT ----- ----- //
class Database {
  constructor() { }

  connect() {
    let thisbd = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(URL, function (err, res) {
        thisbd.mMongoDb = res.db(DB_NAME);
        err ? reject(err) : resolve(true);
      })
    });
  }

  disconnect() {
    if (this.mMongoDb) this.mMongoDb.close();
  }

  drop() {
    return new Promise((resolve, reject) => {
      this.mMongoDb.dropDatabase(function(err, result) {
        err ? reject(err) : resolve(true);
      });
    });
  }

  insert(collection, obj) {
    return this.mMongoDb.collection(collection).insertOne(obj);
  }

  /*query(collection, query) {
    return new Promise((resolve, reject) => {
      //TODO: converting a cursor in an array: not a got idea!
      // USE .find().limit(5).toArray
      this.mMongoDb.collection(collection).find(query).toArray(function(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }*/

  query(collection, query) {
    return this.mMongoDb.collection(collection).find(query);
  }


  /*
   * Promises to insertMeasure an object in a collection
   * @return: true if no error occurred, the error otherwise
   */
  // TODO: Used only for tests, must be removed
  getAllPromise(collection) {
    return new Promise((resolve, reject) => {
      this.mMongoDb.collection(collection).find({}).toArray(function(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
}

const collection = {
  measures: "measures",
  rooms: "rooms"
}


// ----- ----- EXPORTS ----- ----- //
module.exports = {
  Database : Database,
  collection: collection
}
