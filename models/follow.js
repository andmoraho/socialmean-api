const mongoose = require('mongoose');

var FollowSchema = new mongoose.Schema({
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _followed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Number,
        default: null
    }
});

var Follow = mongoose.model('Follow', FollowSchema);

module.exports = { Follow };