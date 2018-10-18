const mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    _emitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: null
    }
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = { Message };