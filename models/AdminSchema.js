const mongoose = require('mongoose');
const Email = require('mongoose-type-email');

const AdminSchema = mongoose.Schema({
    email: {
        type: Email,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Admin', AdminSchema);