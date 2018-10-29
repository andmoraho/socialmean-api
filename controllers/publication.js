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

//GET /publications/:page? (authenticated)
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

// GET /publication/:id (authenticated)
var getPublication = async(req, res) => {
    try {
        const publicationId = req.params.id;

        if (!ObjectID.isValid(publicationId)) {
            throw new Error('Id not valid.');
        }

        var publication = await Publication.findById(publicationId).select({ '__v': 0 });

        res.status(200).send({ publication });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

// DELETE /publication/:id (authenticated)
var deletePublication = async(req, res) => {
    try {
        const publicationId = req.params.id;
        const user = req.user._id;

        if (!ObjectID.isValid(publicationId)) {
            throw new Error('Id not valid.');
        }

        var publicationUser = await Publication.find({ _id: publicationId, _user: user });

        if (publicationUser.length == 0) {
            throw new Error('Unable to delete publication.');
        }

        await Publication.findOneAndDelete({ _id: publicationId, _user: user });

        res.status(200).send({
            message: 'Publication deleted.'
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

// POST /publication/image/:id (authenticated)
var uploadImage = async(req, res) => {
    const publicationId = req.params.id;
    const userId = req.user._id;
    const allowed_extensions = {
        png: 'png',
        jpg: 'jpg',
        jpeg: 'jpeg',
        gif: 'gif'
    };
    try {

        if (req.files) {

            const file_path = req.files.image.path;
            const file_params = file_path.split('\\');
            const file_name = file_params[2];
            const file_name_split = file_name.split('\.');
            const file_extension = file_name_split[1];

            if (!ObjectID.isValid(publicationId)) {
                return removeFileUploaded(res, file_path, 'Id not valid.');
            }

            if (validator.isIn(file_extension, allowed_extensions)) {


                const prevPublication = await Publication.find({
                    _id: publicationId,
                    _user: userId
                });
                const prevImagePath = `./uploads/publications/${prevPublication[0].file}`;

                if (prevPublication.length == 0) {
                    return removeFileUploaded(res, file_path, 'Unable to upload image.');
                }

                var publicationUpdated = await Publication.findOneAndUpdate({
                        _id: publicationId,
                        _user: userId
                    }, { $set: { file: file_name } }, { new: true })
                    .select({ '__v': 0 });

                fs.exists(prevImagePath, (exists) => {
                    if (exists) {
                        fs.unlink(prevImagePath, (error) => {
                            if (error) {
                                // Do nothing
                            };
                        });
                    }

                });

                res.status(200).send({ publicationUpdated });
            } else {
                return removeFileUploaded(res, file_path.toString(), 'Image extension not valid.');
            }

        } else {
            return res.status(400).send({
                message: 'Image is required.'
            });
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }

};

var removeFileUploaded = (res, file_path, message) => {
    fs.unlink(file_path, (error) => {
        return res.status(400).send({
            message
        });
    });
};

//GET /publication/image/:imageFile (authenticated)
var getImagePublication = (req, res) => {
    const imagePublication = req.params.imageFile;
    const imagePath = `./uploads/publications/${imagePublication}`;

    fs.exists(imagePath, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(imagePath));
        } else {
            return res.status(404).send({
                message: 'Unable to find image.'
            });
        }
    });
};

module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImagePublication
};