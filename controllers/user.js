const _ = require('lodash');
const validator = require('validator');
const fs = require('fs');
const path = require('path');

var { ObjectID } = require('mongodb');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');
var { Publication } = require('../models/publication');

// POST /register
var saveUser = async (req, res) => {
  try {
    const body = _.pick(req.body, [
      'name',
      'surname',
      'nick',
      'email',
      'password',
      'role',
      'image'
    ]);
    var user = new User(body);

    await user.save();
    user = user.toObject();
    delete user.password;
    delete user.tokens;

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
};

// POST /login
var loginUser = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    var user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    user = user.toObject();
    delete user.password;
    delete user.tokens;
    delete user.__v;

    res
      .header('x-auth', token)
      .status(200)
      .send(user);
  } catch (error) {
    res.status(404).send();
  }
};

// DELETE / logout(authenticated)
var logoutUser = async (req, res) => {
  try {
    var userLogout = await User.findOneAndUpdate(
      {
        _id: req.user._id
      },
      { $set: { tokens: [] } },
      { new: false }
    );

    res.status(200).send();
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
};

// GET /user/me (authenticated)
var getMe = (req, res) => {
  res.status(200).send(req.user);
};

// GET /user/:id (authenticated)
var getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectID.isValid(userId)) {
      throw new Error('Id not valid.');
    }

    var user = await User.findById(userId).select({
      __v: 0,
      password: 0,
      tokens: 0
    });

    const following = await Follow.find({
      _user: req.user._id
    }).select({ __v: 0, _user: 0, _id: 0 });

    const followedMe = await Follow.find({
      _followed: req.user._id
    }).select({ __v: 0, _followed: 0, _id: 0 });

    res.status(200).send({
      user,
      following,
      followedMe
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
};

// GET /users/page? (authenticated)

var getUsers = async (req, res) => {
  try {
    var page = req.params.page || 1;
    var itemsPerPage = 10;
    var totalUsers = await User.countDocuments({});

    var usersFiltered = await User.find({})
      .select({ __v: 0, role: 0, password: 0, tokens: 0 })
      .skip(itemsPerPage * page - itemsPerPage)
      .limit(itemsPerPage);

    const following = await Follow.find({
      _user: req.user._id
    }).select({ __v: 0, _user: 0, _id: 0 });

    const followedMe = await Follow.find({
      _followed: req.user._id
    }).select({ __v: 0, _followed: 0, _id: 0 });

    res.status(200).send({
      usersFiltered,
      following,
      followedMe,
      total: totalUsers,
      pages: Math.ceil(totalUsers / itemsPerPage),
      currentPage: page
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
};

// GET /user/counters/:id? (authenticated)
var getCounters = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;

    const countFollowing = await Follow.countDocuments({
      _user: userId
    }).select({ __v: 0, _user: 0, _id: 0 });

    const countFollowedMe = await Follow.countDocuments({
      _followed: userId
    }).select({ __v: 0, _followed: 0, _id: 0 });

    const countPublications = await Publication.countDocuments({
      _user: userId
    }).select({ __v: 0, _followed: 0, _id: 0 });

    res.status(200).send({
      countFollowing,
      countFollowedMe,
      countPublications
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
};

// PUT /user/:id (authenticated)
var updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(JSON.parse(Object.keys(req.body)[0]), [
      'name',
      'surname',
      'nick',
      'email',
      'image'
    ]);

    if (!ObjectID.isValid(id) || id != req.user._id) {
      throw new Error('Id not valid.');
    }

    var userUpdated = await User.findOneAndUpdate(
      {
        _id: id
      },
      { $set: body },
      { new: true }
    ).select({ __v: 0, password: 0, tokens: 0 });

    res.status(200).send({ userUpdated });
  } catch (error) {
    res.status(404).send({
      message: 'Unable to update user.'
    });
  }
};

// POST /user/image/:id (authenticated)
var uploadImage = async (req, res) => {
  const id = req.params.id;
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
      const file_name_split = file_name.split('.');
      const file_extension = file_name_split[1];

      if (!ObjectID.isValid(id) || id != req.user._id) {
        return removeFileUploaded(res, file_path, 'User Id not valid.');
      }

      if (validator.isIn(file_extension, allowed_extensions)) {
        const prevUser = await User.findById(id);
        const prevImagePath = `./uploads/users/${prevUser.image}`;

        var userUpdated = await User.findOneAndUpdate(
          {
            _id: id
          },
          { $set: { image: file_name } },
          { new: true }
        ).select({ __v: 0, role: 0, password: 0, tokens: 0 });

        fs.exists(prevImagePath, exists => {
          if (exists) {
            fs.unlink(prevImagePath, error => {
              if (error) {
                // Do nothing
              }
            });
          }
        });

        res.status(200).send({ userUpdated });
      } else {
        return removeFileUploaded(
          res,
          file_path.toString(),
          'Image extension not valid.'
        );
      }
    } else {
      return res.status(400).send({
        message: 'Image is required.'
      });
    }
  } catch (error) {
    res.status(404).send({
      message: 'Unable to update user image.'
    });
  }
};

var removeFileUploaded = (res, file_path, message) => {
  fs.unlink(file_path, error => {
    return res.status(400).send({
      message
    });
  });
};

//GET /user/image/:imageFile (authenticated)
var getImageUser = (req, res) => {
  const imageUser = req.params.imageFile;
  const imagePath = `./uploads/users/${imageUser}`;

  fs.exists(imagePath, exists => {
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
  saveUser,
  loginUser,
  logoutUser,
  getMe,
  getUser,
  getUsers,
  getCounters,
  updateUser,
  uploadImage,
  getImageUser
};
