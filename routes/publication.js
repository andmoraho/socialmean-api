const express = require('express');
const PublicationController = require('../controllers/publication');

const { authenticate } = require('../middleware/authenticate');
const { md_upload_publications } = require('../middleware/uploadImage');

var api = express.Router();

api.post('/publication', authenticate, PublicationController.savePublication);
api.get('/publications/:page?', authenticate, PublicationController.getPublications);
api.get('/publication/:id', authenticate, PublicationController.getPublication);
api.delete('/publication/:id', authenticate, PublicationController.deletePublication);
api.post('/publication/image/:id', [authenticate, md_upload_publications], PublicationController.uploadImage);
api.get('/publication/image/:imageFile', PublicationController.getImagePublication);

module.exports = api;