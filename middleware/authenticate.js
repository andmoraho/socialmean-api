const moment = require('moment');

var { User } = require('../models/user');

var authenticate = async(req, res, next) => {
    var token = req.header('x-auth');
    var decoded = User.findByToken(token, process.env.JWT_SECRET);

    try {
        var user = await User.findByToken(token);

        if (decoded.exp < moment().unix()) {
            throw new Error('');
        }

        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        res.status(401).send({
            message: 'Invalid token.'
        });
    }
};

module.exports = { authenticate };