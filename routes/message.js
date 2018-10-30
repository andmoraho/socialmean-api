const express = require('express');
const MessageController = require('../controllers/message');

const { authenticate } = require('../middleware/authenticate');

var api = express.Router();

api.post('/message', authenticate, MessageController.saveMessage);
api.get('/messages/:page?', authenticate, MessageController.getMessage);

module.exports = api;