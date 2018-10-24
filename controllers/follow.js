const _ = require('lodash');
const validator = require('validator');

var { ObjectID } = require('mongodb');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');

// POST /follow (authenticated)
var saveFollow = async(req, res) => {
    try {
        const body = _.pick(req.body, ['_followed']);
        const _user = req.user._id;

        if (!ObjectID.isValid(_user) && !ObjectID.isValid(body._followed)) {
            return res.status(400).send({
                message: 'Id not valid.'
            });
        }

        const follow = new Follow();
        follow._user = _user;
        follow._followed = body._followed;

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

module.exports = {
    saveFollow
}