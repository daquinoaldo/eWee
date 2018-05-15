const MongoClient = require('mongodb').MongoClient;


// ----- ----- CONSTANTS AND GLOBALS ----- ----- //
const URL = "mongodb://localhost:27017/";
const DB_NAME = "mcps";

let mongoDB;

// ----- ----- DATABASE OBJECT ----- ----- //
class Database {
  constructor() { }

  connect() {
    return new Promise(async (resolve, reject) => {
      await Database.disconnect();
      MongoClient.connect(URL).then((res, err) => {
        if (err) reject(err);
        mongoDB = res.db(DB_NAME);
        resolve(true);
      })
    });
  }

  static async disconnect() {
    if (mongoDB) await mongoDB.close();
  }

  static drop() {
    return mongoDB.dropDatabase();
  }

  static insert(collection, obj) {
    return mongoDB.collection(collection).insertOne(obj);
  }

  static query(collection, query) {
    return mongoDB.collection(collection).find(query);
  }

  // Used only for tests
  static queryAll(collection) {
    return mongoDB.collection(collection).find({}).toArray();
  }

}

const collections = {
  measures: "measures",
  rooms: "rooms",
  actions:"actions",
  status: "status",
  statistics: "statistics",
  policy: "policy"
};


// ----- ----- EXPORTS ----- ----- //
module.exports = {
  Database : Database,
  collection: collections
};
