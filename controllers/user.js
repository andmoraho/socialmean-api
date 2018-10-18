const _ = require('lodash');

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

var loginUser = async(req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).status(200).send(user);
    } catch (error) {
        res.status(400).send();
    }
};

var logoutUser = async(req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (error) {
        res.status(400).send();
    }
};

var getUser = (req, res) => {
    res.send(req.user);
};

module.exports = {
    home,
    tests,
    saveUser,
    loginUser,
    logoutUser,
    getUser
};