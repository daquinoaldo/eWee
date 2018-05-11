//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/test';
mongoose.connect(mongoDB);
// Trying to connect
var db = mongoose.connection;
// Handling error
db.on('error', console.error.bind(console, 'connection error:'));
// Connected :/
db.once('open', function() {
  console.log('Connected to "test"');
});
