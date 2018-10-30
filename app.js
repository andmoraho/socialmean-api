const express = require('express');
const bodyParser = require('body-parser');

var app = express();

//load routes
const userRoutes = require('./routes/user');
const followRoutes = require('./routes/follow');
const publicationRoutes = require('./routes/publication');
const messageRoutes = require('./routes/message');

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

//exports
module.exports = { app };