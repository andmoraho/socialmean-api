const jwt = require('jsonwebtoken');

const { User } = require('../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '60m' });
    } catch (error) {
        res.status(401).send({
            message: 'User not found.'
        });
    }

    User.findOne({
        '_id': decoded._id
    }, (error, result) => {
        if (error) {
            res.status(401).send({
                message: 'Token not valid. Unauthorized.'
            });
        }

        req.user = result;
        req.token = token;
        next();
    });
};

module.exports = { authenticate };