const MongoClient = require('mongodb').MongoClient;

// ----- ----- CONSTANTS AND GLOBALS ----- ----- //
URL = "mongodb://localhost:27017/";
DB_NAME = "envir_sensing";
exports.sampleCollection = "samples"

PIR = '2AC5';

class Database {

    gMongoDb;

    /*
     * Promises to connect to the database
     * @return: ?
     */
    constructor() {
        const thiz = this;
        return new Promise((resolve, reject) => {
            MongoClient.connect(URL, function (err, db) {
                thiz.gMongoDb = db.db(DB_NAME);
                err ? reject(err) : resolve(true);
            })
        })
    }

// ----- ----- FS ORDER API ----- ----- //
    /*
     * Promises to drop the database
     * @return: true on success, an error otherwise
     */
    mongoDropPromise() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(URL, function (err, db) {
                if (err) reject(err);
                db.dropDatabase(function(err, result){
                    db.close();
                    err ? reject(err) : resolve(true);
                });
            });
        });
    }

    drop() {
        return new Promise((resolve, reject) => {
            this.gMongoDb.dropDatabase(function(err, result) {
                err ? reject(err) : resolve(true);
            });
        });
    }

    /*
     * Promises to insert an object in a collection
     * @return: true if no error occurred, the error otherwise
     */
    insertPromise(collection, obj) {
        return new Promise((resolve, reject) => {
            gMongoDb.collection(collection).insertOne(obj, function (err, res) {
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
            gMongoDb.collection(collection).find({}).toArray(function(err, result) {
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
            gMongoDb.collection(collection).find(query).toArray(function(err, result) {
                err ? reject(err) : resolve(result);
            });
        });
    }


// ----- ----- SC ORDER API ----- ----- //
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
