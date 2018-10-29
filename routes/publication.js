const express = require('express');
const PublicationController = require('../controllers/publication');

const { authenticate } = require('../middleware/authenticate');
const { md_upload_publications } = require('../middleware/uploadImage');

var api = express.Router();

api.post('/publication', authenticate, PublicationController.savePublication);
api.get('/publications/:page?', authenticate, PublicationController.getPublications);

module.exports = api;