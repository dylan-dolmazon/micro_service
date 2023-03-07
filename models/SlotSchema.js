const mongoose = require('mongoose');

const SlotSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    isAvailable: {
        type: Boolean,
        required: true
    },
    shopId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: false
    },
    clientId: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Slot', SlotSchema);