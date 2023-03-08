const mongoose = require('mongoose');
const Email = require('mongoose-type-email');

const ClientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: Email,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Client', ClientSchema);