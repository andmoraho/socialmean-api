const express = require('express');
const FollowController = require('../controllers/follow');

const { authenticate } = require('../middleware/authenticate');
const { md_upload } = require('../middleware/uploadImage');

var api = express.Router();

api.post('/follow', authenticate, FollowController.saveFollow);
api.delete('/follow', authenticate, FollowController.deleteFollow);
api.get('/following/:page?', authenticate, FollowController.getFollowedUser);

module.exports = api;