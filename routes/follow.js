const express = require('express');
const FollowController = require('../controllers/follow');

const { authenticate } = require('../middleware/authenticate');

var api = express.Router();

api.post('/follow', authenticate, FollowController.saveFollow);
api.delete('/follow', authenticate, FollowController.deleteFollow);
api.get('/following/:page?', authenticate, FollowController.getFollowingUser);
api.get('/followed/:page?', authenticate, FollowController.getFollowedUser);
api.get('/follows/:followed?', authenticate, FollowController.getMyFollows);

module.exports = api;