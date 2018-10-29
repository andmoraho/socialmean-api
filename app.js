const express = require('express');
const bodyParser = require('body-parser');

var app = express();

//load routes
const userRoutes = require('./routes/user');
const followRoutes = require('./routes/follow');
const publicationRoutes = require('./routes/publication');

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);

//exports
module.exports = { app };