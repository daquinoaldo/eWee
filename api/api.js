const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Query = require('../database/query.js').Query;
const query = new Query();
Query.init()
  .then(() => {
    app.listen(port, "0.0.0.0");
    console.log("API running on port " + port);
  });

/* SAMPLES
app.get('/:some_data', function (req, res) {
    console.log('Got a GET request for '+req.params.some_data)
    res.send('Got a GET request for '+req.params.some_data)
})

app.post('/:some_data', function (req, res) {
    console.log('Got a POST request for '+req.params.some_data)
    res.send('Got a POST request for '+req.params.some_data)
})

app.delete('/:some_data', function (req, res) {
    console.log('Got a DELETE request for '+req.params.some_data)
    res.send('Got a DELETE request for '+req.params.some_data)
})*/

app.get('/sensor/:id', function (req, res) {
  Query.getLastMeasure(req.params.id).then(measure => {
    res.send(measure);
  })
});

app.get('/sensor/:id/:attribute', function (req, res) {
  Query.getLastMeasure(req.params.id, req.params.attribute).then(measure => {
    res.send(measure[req.params.attribute].toString());
  })
});

app.get('/home/:attribute', function (req, res) {
  Query.getLastMeasure(null, req.params.attribute).then(measure =>
    res.send(measure[req.params.attribute].toString()));
});

app.post('/home/room/', function (req, res) {
  query.addRoom(req.body.name)
    .then(id => res.send(id))
    .catch(err => res.status(403).send(err));
});

/*GET
- sensor/<id>
- sensor/<id>/<attribute>
room/<id>
room/<id>/<attribute>
home
- home/<attribute>

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
room/<id>/sensor/<id=value>
room/<id>/actuator/<id=value>

DELETE
home/room/<id>
room/<id>/sensor/<id>
room/<id>/actuator/<id>
*/