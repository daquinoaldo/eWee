const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// ----- ----- CONSTANTS AND GLOBALS ----- ----- //
const URL = "mongodb://localhost:27017/";
const DB_NAME = "mcps";

let mongoDB;

// ----- ----- DATABASE OBJECT ----- ----- //
/**
 * Easy shortcuts for database.
 * Contains the mongodb object ad operates on it.
 * NOTE: doesn't contains safety and security checks, this is done by the higher level class Query.
 */
class Database {
  constructor() { }

  /**
   * Must be called before do anything
   * @returns Promise<any> that you mus await before do anything else
   */
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

  static update(collection, id, update) {
    return mongoDB.collection(collection).updateOne({_id: ObjectID(id)}, update);
  }

  static delete(collection, id) {
    return mongoDB.collection(collection).deleteOne({_id: ObjectID(id)});
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
  collections: collections
};