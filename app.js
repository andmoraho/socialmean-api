const express = require('express');
const bodyParser = require('body-parser');

var app = express();

//load routes
const userRoutes = require('./routes/user');

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.use('/api', userRoutes);

//exports
module.exports = { app };