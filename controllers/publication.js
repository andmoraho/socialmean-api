const _ = require('lodash');
const validator = require('validator');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

var { ObjectID } = require('mongodb');
var { Publication } = require('../models/publication');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');

var savePublication = async(req, res) => {
    try {
        const body = _.pick(req.body, ['text', 'file']);

        if (validator.isEmpty(body.text)) {
            throw new Error('Text is required.');
        }

        const publication = new Publication();

        publication.text = body.text;
        publication.file = 'null';
        publication._user = req.user._id;
        publication.createdAt = moment().valueOf();

        var publicationStored = await publication.save();
        publicationStored = publicationStored.toObject();
        delete publicationStored.__v;

        res.status(200).send({
            publication: publicationStored
        });

    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }

};

module.exports = {
    savePublication
};