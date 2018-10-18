const moment = require('moment');

var { User } = require('../models/user');

var authenticate = async(req, res, next) => {
    var token = req.header('x-auth');
    var decoded = User.checkExpiredToken(token, process.env.JWT_SECRET);

    try {
        var user = await User.findByToken(token);

        if (!user) {
            throw new Error('');
        }

        if (decoded.exp < moment().unix()) {
            throw new Error('');
        }

        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        res.status(401).send();
    }



    // var user = User.findByToken(token).then((user) => {
    //     if (!user) {
    //         return Promise.reject();
    //     }

    //     if (decoded.exp < moment().unix()) {
    //         return Promise.reject();
    //     }

    //     req.user = user;
    //     req.token = token;
    //     next();
    // }).catch((error) => {
    //     res.status(401).send();
    // });
};

module.exports = { authenticate };