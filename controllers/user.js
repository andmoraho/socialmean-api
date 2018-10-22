const _ = require('lodash');
const validator = require('validator');
const fs = require('fs');
const path = require('path');

var { ObjectID } = require('mongodb');
var { User } = require('../models/user');

var home = (req, res) => {
    res.status(200).send({
        message: 'Welcome to home'
    });
};


var tests = (req, res) => {
    res.status(200).send({
        message: 'This is a test'
    });
};

// POST /register
var saveUser = async(req, res) => {
    try {
        const body = _.pick(req.body, ['name', 'surname', 'nick', 'email', 'password', 'role', 'image']);
        const user = new User(body);

        await user.save();
        res.status(200).send(user);
    } catch (error) {

        res.status(400).send({
            message: error.message
        });
    }
};

// POST /login
var loginUser = async(req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).status(200).send(user);
    } catch (error) {
        res.status(404).send();
    }
};

// DELETE /logout (authentocated)
var logoutUser = async(req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (error) {
        res.status(400).send();
    }
};

// GET /me (authentocated)
var getMe = (req, res) => {
    res.status(200).send(req.user);
};

// GET /user/:id (authenticated)
var getUser = async(req, res) => {
    const userId = req.params.id;

    if (!ObjectID.isValid(userId)) {
        return res.status(400).send();
    }

    try {
        const user = await User.findById(userId);

        res.status(200).send({ user });
    } catch (error) {
        res.status(404).send({ error });
    }
};

// GET /users/page? (authenticated)

var getUsers = async(req, res) => {
    const userId = req.user._id;
    var page = req.params.page || 1
    var itemsPerPage = 1;

    try {

        var totalUsers = await User.find({}).exec();

        var usersFiltered = await User.find({})
            .skip((itemsPerPage * page) - itemsPerPage)
            .limit(itemsPerPage);

        res.status(200).send({
            usersFiltered,
            total: totalUsers.length,
            pages: Math.ceil(totalUsers.length / itemsPerPage),
            currentPage: page
        });

    } catch (error) {
        res.status(404).send({ error });
    }
};

// PUT /user/:id (authenticated)

var updateUser = async(req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'surname', 'nick', 'email', 'image']);

    if (!ObjectID.isValid(id) || id != req.user._id) {
        return res.status(400).send({
            message: 'User Id not valid.'
        });
    }

    try {
        const userUpdated = await User.findOneAndUpdate({
            _id: id
        }, { $set: body }, { new: true });

        res.status(200).send({ userUpdated });
    } catch (error) {
        res.status(404).send({
            message: 'Unable to update user.'
        });
    }

};

// POST /user/image/:id (authenticated)
var uploadImage = async(req, res) => {
    const id = req.params.id;
    const allowed_extensions = {
        png: 'png',
        jpg: 'jpg',
        jpeg: 'jpeg',
        gif: 'gif'
    };

    if (req.files) {

        const file_path = req.files.image.path;
        const file_params = file_path.split('\\');
        const file_name = file_params[2];
        const file_name_split = file_name.split('\.');
        const file_extension = file_name_split[1];

        if (!ObjectID.isValid(id) || id != req.user._id) {
            return removeFileUploaded(res, file_path, 'User Id not valid.');
        }

        if (validator.isIn(file_extension, allowed_extensions)) {

            try {
                const prevUser = await User.findById(id);
                const prevImagePath = `./uploads/users/${prevUser.image}`;

                const userUpdated = await User.findOneAndUpdate({
                    _id: id
                }, { $set: { image: file_name } }, { new: true });

                fs.exists(prevImagePath, (exists) => {
                    if (exists) {
                        fs.unlink(prevImagePath, (error) => {
                            if (error) {
                                // Do nothing
                            };
                        });
                    }

                });

                res.status(200).send({ userUpdated });
            } catch (error) {
                res.status(404).send({
                    message: 'Unable to update user image.'
                });
            }

        } else {
            return removeFileUploaded(res, file_path.toString(), 'Image extension not valid.');
        }

    } else {
        return res.status(400).send({
            message: 'Image is required.'
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

var getImageUser = (req, res) => {
    const imageUser = req.params.imageFile;
    const imagePath = `./uploads/users/${imageUser}`;

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
    home,
    tests,
    saveUser,
    loginUser,
    logoutUser,
    getMe,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageUser
};