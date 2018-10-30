const _ = require('lodash');
const validator = require('validator');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

var { ObjectID } = require('mongodb');
var { Publication } = require('../models/publication');
var { User } = require('../models/user');
var { Follow } = require('../models/follow');
var { Message } = require('../models/message');

// POST /message (authenticated)
var saveMessage = async(req, res) => {
    try {
        const _emitter = req.user._id;
        const body = _.pick(req.body, ['text', '_receiver']);

        if (!ObjectID.isValid(body._receiver)) {
            throw new Error('Receiver Id not valid.');
        }

        if (validator.isEmpty(body.text)) {
            throw new Error('Text is required.');
        }

        const message = new Message();

        message.text = body.text;
        message._emitter = _emitter;
        message._receiver = body._receiver;
        message.createdAt = moment().valueOf();

        var messageStored = await message.save();
        // messageStored = messageStored.toObject();
        // delete messageStored.__v;

        res.status(200).send({
            message: messageStored
        });

    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

// GET /messages/:page? (authenticated)
var getMessage = async(req, res) => {
    try {
        const userId = req.user._id;
        var page = req.params.page || 1;
        var itemsPerPage = 5;

        if (!ObjectID.isValid(userId)) {
            throw new Error('Id not valid.');
        }

        var totalMessages = await Message.countDocuments({
            _receiver: userId
        });

        var messagesFiltered = await Message.find({
                _receiver: userId
            })
            .populate({
                path: '_emitter',
                select: '-password -tokens -__v'
            })
            .skip((itemsPerPage * page) - itemsPerPage)
            .limit(itemsPerPage);

        res.status(200).send({
            messagesFiltered,
            total: totalMessages,
            pages: Math.ceil(totalMessages / itemsPerPage),
            currentPage: page
        });


    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
};

module.exports = {
    saveMessage,
    getMessage
};