const express = require('express');
const UserController = require('../controllers/user');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/tests', UserController.tests);


module.exports = api;