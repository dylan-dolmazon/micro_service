const mongoose = require('mongoose');

import ClientSchema from './ClientSchema';
import OrderSchema from './OrderSchema';
import ShopSchema from './ShopSchema';

const SlotSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    isAvailable: {
        type: Boolean,
        required: true
    },
    shop: {
        type: ShopSchema,
        required: true
    },
    order: {
        type: OrderSchema,
        required: false
    },
    client: {
        type: ClientSchema,
        required: false
    }
});

module.exports = mongoose.model('Slot', SlotSchema);