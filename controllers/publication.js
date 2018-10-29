const _ = require('lodash');
const validator = require('validator');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

var { ObjectID } = require('mongodb');
var { Publication } = require('../models/publication');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');

// POST /publication (authenticated)
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

//GET /publications (authenticated)
var getPublications = async(req, res) => {
    try {
        var page = req.params.page || 1;
        var itemsPerPage = 5;
        var followsClean = [];

        var followsFiltered = await Follow.find({
                _user: req.user._id
            })
            .populate({
                path: '_followed',
                select: '-password -tokens -__v'
            });

        followsFiltered.forEach((follow) => {
            followsClean.push(follow._followed);
        });

        var totalFollowing = await Follow.find({
            _user: { "$in": followsClean }
        });

        var publicationsPaginated = await Publication.find({
                _user: { "$in": followsClean }
            })
            .sort('-createdAt')
            .populate({
                path: '_user',
                select: '-password -tokens -__v'
            })
            .select({ '__v': 0 })
            .skip((itemsPerPage * page) - itemsPerPage)
            .limit(itemsPerPage);

        res.status(200).send({
            publicationsPaginated,
            total: totalFollowing.length,
            pages: Math.ceil(totalFollowing.length / itemsPerPage),
            currentPage: page
        });


    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

module.exports = {
    savePublication,
    getPublications
};