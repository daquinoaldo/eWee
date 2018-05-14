const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Query = require('../database/query.js').Query;
const query = new Query();
query.init();

app.get('/:some_data', function (req, res) {
    console.log('Got a GET request for '+req.params.some_data);
    res.send('Got a GET request for '+req.params.some_data);
});

app.post('/:some_data', function (req, res) {
    console.log('Got a POST request for '+req.params.some_data);
    res.send('Got a POST request for '+req.params.some_data);
});

app.delete('/:some_data', function (req, res) {
    console.log('Got a DELETE request for '+req.params.some_data);
    res.send('Got a DELETE request for '+req.params.some_data);
});

module.exports = app;