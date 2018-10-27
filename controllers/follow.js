const _ = require('lodash');
const validator = require('validator');
const moment = require('moment');

var { ObjectID } = require('mongodb');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');

// POST /follow (authenticated)
var saveFollow = async(req, res) => {
    try {
        const body = _.pick(req.body, ['_followed']);
        const _user = req.user._id;
        const _followed = body._followed;

        var isFollowed = await Follow.find({ _user, _followed });

        if (!ObjectID.isValid(_user) && !ObjectID.isValid(_followed)) {
            throw new Error('Id not valid');
        }
        if (validator.equals(_user.toString(), _followed.toString())) {
            throw new Error('Follow yourself?');
        }
        if (isFollowed.length > 0) {
            if (!validator.isEmpty(isFollowed[0]._id.toString())) {
                throw new Error('Already following this user.');
            }
        }

        const follow = new Follow();
        follow._user = _user;
        follow._followed = body._followed;
        follow.createdAt = moment().valueOf();
        const followStored = await follow.save();

        res.status(200).send({
            followStored
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }

};

// DELETE /follow (authenticated)
var deleteFollow = async(req, res) => {
    try {
        const body = _.pick(req.body, ['_followed']);
        const _user = req.user._id;
        const _followed = body._followed;

        if (!ObjectID.isValid(_user) && !ObjectID.isValid(_followed)) {
            throw new Error('Id not valid.');
        }

        await Follow.find({ _user, _followed }).deleteOne();

        res.status(200).send({
            message: 'Follow deleted.'
        });

    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

// GET /followed/:page?
var getFollowedUser = async(req, res) => {
    const userId = req.user._id;
    var page = req.params.page || 1;
    var itemsPerPage = 5;
    try {

        if (!ObjectID.isValid(userId)) {
            throw new Error('Id not valid.');
        }

        var totalFollowed = await Follow.find({
            _user: userId
        });

        var followsFiltered = await Follow.find({
                _user: userId
            })
            .populate({
                path: '_followed'
            })
            .skip((itemsPerPage * page) - itemsPerPage)
            .limit(itemsPerPage);

        res.status(200).send({
            followsFiltered,
            total: totalFollowed.length,
            pages: Math.ceil(totalFollowed.length / itemsPerPage),
            currentPage: page
        });

    } catch (error) {
        res.status(404).send({
            error
        });
    }
};

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowedUser
};