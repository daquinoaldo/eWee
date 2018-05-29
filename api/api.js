const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*
 * https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
 * Corsair is needed to set the correct headers and allow third party
 * applications to access the api
 */
app.use(cors());


/*
app.listen(port, "0.0.0.0");
app.get('/:some_data', function (req, res) {
  console.log('Got a GET request for '+req.params.some_data);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ a: 1 }));
});*/

const Query = require('../database/query.js').Query;
Query.init()
  .then(() => {
    app.listen(port, "0.0.0.0");
    console.log("API running on port " + port);
  });


/* LIST OF APIs
GET
sensors (and rooms and devices):
- home
- home/<attribute>
- room/<id>
- room/<id>/<attribute>
- room/<id>/stats/yyyy/mm/dd
- sensor/<id>
- sensor/<id>/<attribute>

policy:
- policy/<room>

POST
actuators:
- actuator/<id>/<attribute=value>

rooms and binding:
- home/room/<name=value>
- room/<id>/device/<id=value>

policy:
- policy/<room>

DELETE
rooms and unbinding:
- home/room/<id>
- room/<id>/device/<id>
*/



/* ********************************
 ********** GET REQUESTS **********
 **********************************/

// Get the status of the house
app.get('/home', (req, res) => {
  Query.getHome()
    .then(home => res.send(home))
    .catch(err => res.status(404).send({error: err}))
});

// Get a specific attribute of the status of the house
app.get('/home/:attribute', (req, res) => {
  Query.getHomeStatus(req.params.attribute)
    .then(attr => res.send(attr.toString()))
    .catch(err => res.status(404).send({error: err}))
});


// Get the status of a specific room
app.get('/room/:id', (req, res) => {
  Query.getRoom(req.params.id)
    .then(room => res.send(room))
    .catch(err => res.status(404).send({error: err}))
});

// Get a specific attribute of the status of a specific room
app.get('/room/:id/:attribute', (req, res) => {
  Query.getRoomStatus(req.params.id, req.params.attribute)
    .then(attr => res.send(attr.toString()))
    .catch(err => res.status(404).send({error: err}))
});

// Get statistic of a specific room in a specific day
app.get('/room/:id/stats/:yyyy/:mm/:dd', (req, res) => {
  Query.getStats(req.params.id, req.params.yyyy, req.params.mm, req.params.dd)
    .then(stats => res.send(stats))
    .catch(err => res.status(404).send({error: err}))
});


// Get last measure from a specific sensor
app.get('/sensor/:id', (req, res) => {
  Query.getLastMeasure(req.params.id)
    .then(measure => res.send(measure))
    .catch(err => res.status(404).send({error: err}))
});

// Get a specific attribute of the last measure from a specific sensor
app.get('/sensor/:id/:attribute', (req, res) => {
  Query.getLastMeasure(req.params.id, req.params.attribute)
    .then(attr => res.send(attr.toString()))
    .catch(err => res.status(404).send({error: err}))
});

// Get the policy from a specific room
app.get('/policy/:room', (req, res) => {
  Query.getPolicy(req.params.room)
    .then(policy => res.send(policy))
    .catch(err => res.status(404).send({error: err}))
});



/* *********************************
 ********** POST REQUESTS **********
 ***********************************/

// Create new action for an actuator, setting an its attribute.
// Pass the value that you want to assign to the attribute in the body as a JSON obj: {"value": "the_attribute_value"}
app.post('/actuator/:id/:attribute',  (req, res) => {
  Query.setKey(req.params.id, req.params.attribute, req.body.value)
    .then(ok => res.send(ok))
    .catch(err => res.status(403).send({error: err}))
});

// Create new room, pass the room name in the body as a JSON obj: {"name": "the_room_name"}
app.post('/home/room/',  (req, res) => {
  Query.createRoom(req.body.name)
    .then(id => res.send(id))
    .catch(err => res.status(403).send({error: err}))
});

// Rename a room, pass the room name in the body as a JSON obj: {"name": "the_room_name"}
app.post('/home/room/:id',  (req, res) => {
  Query.updateRoom(req.params.id, req.body.name)
    .then(id => res.send(id))
    .catch(err => res.status(403).send({error: err}))
});

// Bind a sensor to a room, no body required
app.post('/room/:roomID/device/:deviceID', (req, res) => {
  Query.bind(req.params.deviceID, req.params.roomID)
    .then((ok) => res.send(ok))
    .catch(err => res.status(500).send({error: err}))
});

// Create new room, pass the room name in the body as a JSON obj: {"name": "the_room_name"}
app.post('/policy/:room/',  (req, res) => {
  Query.setPolicy(req.params.room, req.body)
    .then(id => res.send(id))
    .catch(err => res.status(403).send({error: err}))
});



/* ***********************************
 ********** DELETE REQUESTS **********
 *************************************/

// Delete a room
app.delete('/home/room/:id', (req, res) => {
  Query.deleteRoom(req.params.id)
    .then((ok) => res.send(ok))
    .catch(err => res.status(403).send({error: err}))
});

// Unbind a sensor from a room, no body required
app.delete('/room/:roomID/device/:deviceID', (req, res) => {
  Query.unbind(req.params.deviceID, req.params.roomID)
    .then((ok) => res.send(ok))
    .catch(err => res.status(500).send({error: err}))
});

// Unbind a sensor from a room, no body required
app.delete('/home/device/:deviceID', (req, res) => {
  Query.unbind(req.params.deviceID)
    .then((ok) => res.send(ok))
    .catch(err => res.status(500).send({error: err}))
});