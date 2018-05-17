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
})
*/


const Query = require('../database/query.js').Query;
const query = new Query();
Query.init()
  .then(() => {
    app.listen(port, "0.0.0.0");
    console.log("API running on port " + port);
  });


/* ********************************
 ********** GET REQUESTS **********
 **********************************/


// Get last measure from a specific sensor
app.get('/sensor/:id', (req, res) => {
  Query.getLastMeasure(req.params.id)
    .then(measure => res.send(measure))
    .catch(err => res.status(404).send(err))
});

// Get a specific attribute of the last measure from a specific sensor
app.get('/sensor/:id/:attribute', (req, res) => {
  Query.getLastMeasure(req.params.id, req.params.attribute)
    .then(attr => res.send(attr.toString()))
    .catch(err => res.status(404).send(err))
});

//TODO: la query deve prendere dalla collections status
app.get('/home/:attribute', (req, res) => {
  Query.getLastMeasure(null, req.params.attribute)
    .then(measure => res.send(measure[req.params.attribute].toString()))
});


/* *********************************
 ********** POST REQUESTS **********
 ***********************************/

// Create new room, pass the room name in the body as a JSON obj: {"name": "the_room_name"}
app.post('/home/room/',  (req, res) => {
  query.createRoom(req.body.name)
    .then(id => res.send(id))
    .catch(err => res.status(403).send(err))
});

// Bind a sensor to a room, no body required
//TODO: should I verify that there is a sensors in the network with this mac that streams data?
app.post('/room/:roomID/device/:deviceID', (req, res) => {
  Query.bind(req.params.deviceID, req.params.roomID)
    .then((ok) => res.send(ok))
    .catch(err => {
      console.error(err);
      res.status(500).send("Unknown error.");
    })
});


/* ***********************************
 ********** DELETE REQUESTS **********
 *************************************/

// Delete a room
app.delete('/home/room/:id', (req, res) => {
  Query.deleteRoom(req.params.id)
    .then((ok) => res.send(ok))
    .catch(err => res.status(403).send(err))
});

// Unbind a sensor from a room, no body required
app.delete('/room/:roomID/device/:deviceID', (req, res) => {
  Query.unbind(req.params.deviceID, req.params.roomID)
    .then((ok) => res.send(ok))
    .catch(err => {
      console.error(err);
      res.status(500).send("Unknown error.");
    })
});

/*GET
- sensor/<id>
- sensor/<id>/<attribute>
room/<id>
room/<id>/<attribute>
home
home/<attribute>

home/rooms
home/sensors
home/actuators
room/<id>/sensors
room/<id>/actuators

POST
actuator/<id>/<attribute=value>
room/<id>/<attribute=value>
home/<attribute=value>

- home/room/<name=value>
- room/<id>/device/<id=value>

DELETE
- home/room/<id>
- room/<id>/device/<id>
*/
