const express = require('express');
const FollowController = require('../controllers/follow');

const { authenticate } = require('../middleware/authenticate');
const { md_upload } = require('../middleware/uploadImage');

var api = express.Router();

api.post('/follow', authenticate, FollowController.saveFollow);

module.exports = api;