const express = require('express');
const MessageController = require('../controllers/message');

const { authenticate } = require('../middleware/authenticate');

var api = express.Router();

api.post('/message', authenticate, MessageController.saveMessage);
api.get('/messages/received/:page?', authenticate, MessageController.getMessageReceived);
api.get('/messages/sent/:page?', authenticate, MessageController.getMessageSent);
api.get('/messages/unviewed', authenticate, MessageController.getMessageUnViewed);
api.get('/messages/viewed', authenticate, MessageController.setMessageViewed);

module.exports = api;