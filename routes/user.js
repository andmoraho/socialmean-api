const express = require('express');
const UserController = require('../controllers/user');

var { authenticate } = require('../middleware/authenticate');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/tests', UserController.tests);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.delete('/logout', authenticate, UserController.logoutUser);
api.get('/me', authenticate, UserController.getUser);


module.exports = api;