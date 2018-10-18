const mongoose = require('mongoose');

var PublicationSchema = new mongoose.Schema({
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    file: {
        type: String
    },
    createdAt: {
        type: Number,
        default: null
    }

});

var Publication = mongoose.model('Publication', PublicationSchema);

module.exports = { Publication };