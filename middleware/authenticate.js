const moment = require('moment');

var { User } = require('../models/user');

var authenticate = async(req, res, next) => {
    var token = req.header('x-auth');

    try {

        var user = await User.findByToken(token);

        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        res.status(401).send({
            message: 'Token not valid. Unauthorized.'
        });
    }
};

module.exports = { authenticate };