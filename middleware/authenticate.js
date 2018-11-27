const jwt = require('jsonwebtoken');

const { User } = require('../models/user');

var authenticate = (req, res, next) => {
    try {
        var token = req.header('x-auth');
        var decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    } catch (error) {
        res.status(401).send({
            message: 'User not found.'
        });
    }
};

module.exports = { authenticate };