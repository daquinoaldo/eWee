const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const dbname = "mydb";

let db

function connect() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            err ? reject(err) : resolve(db.db(dbname))
        })
    })
}

function insert(collection, obj) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(obj, function (err, res) {
            err ? reject(err) : resolve(true)
        });
    });
}

async function main() {
    db = await connect();
    const testObj = {
        id: 1,
        temp: 18,
        humid: 88
    }

    if(await insert("prova", testObj) === true) console.log("Funge");
}

main();