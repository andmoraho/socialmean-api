const express = require('express');
const UserController = require('../controllers/user');

const { authenticate } = require('../middleware/authenticate');
const { md_upload } = require('../middleware/uploadImage');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/tests', UserController.tests);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.delete('/logout', authenticate, UserController.logoutUser);
api.get('/me', authenticate, UserController.getMe);
api.get('/user/:id', authenticate, UserController.getUser);
api.get('/users/:page?', authenticate, UserController.getUsers);
api.put('/user/:id', authenticate, UserController.updateUser);
api.post('/user/image/:id', [authenticate, md_upload], UserController.uploadImage);
api.get('/user/image/:imageFile', UserController.getImageUser);

module.exports = api;