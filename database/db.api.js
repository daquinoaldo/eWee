//Import the mongoose module
var mongoose = require('mongoose');


// ----- ----- FS ORDER API ----- ----- //
/*
 *
 * @returns: 
 */
var getConnectionPromise = function (url) {
  mongoose.connect(url);
  var db = mongoose.connection;
  var connectionPromise = new Promise(function(resolve, reject) {
    db.once('open', () => resolve(true));
    db.on('error', () => reject(false));
  });
  return connectionPromise;
}

/*
 *
 * @returns:
 */
var getSensorId = function (url) {

}

// ----- ----- SC ORDER API ----- ----- //
/*
 *
 * @returns:
 */
var getCharacteristic = function (url) {

}



// ----- ----- Main for Testing ----- ----- //
(async () => {
  let connectionPromise = getConnectionPromise('mongodb://127.0.0.10/envir_sensing');
  let res = await connectionPromise;
})();
