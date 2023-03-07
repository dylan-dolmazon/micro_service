const Admin = require('../models/adminSchema');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const mailController = require('./mailController');
async function register(req, res) {
    try {
        let hash = await bcrypt.hash(req.body.password, 10);
        const admin = new Admin({
            email: req.body.email,
            password: hash
        });
        let adminSave = await admin.save();
        console.log('adminSave: ', adminSave);
        res.status(200).json(adminSave);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function login(req, res) {
    try {
        let admin = await Admin.findOne({email: req.body.email})
        if(admin===null)
            return res.status(404).json({ error: 'Admin not found !' });
        let isCompare = await bcrypt.compare(req.body.password, admin.password);
        if(!isCompare)
            return res.status(401).json({ error: 'Wrong password !' });
        res.status(200).json({admin: admin, token: jwt.sign(
            { email: admin.email },
            'adminsdgkh56k46g723sq568etfgfd3sgfdy5s7q564f2T',
            { expiresIn: '24h' }
        )});
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}
async function validateOrder(req, res) {
    try {
        let order = await Order.findOne({ _id: req.params.orderId })
        if (order === null)
            return res.status(404).json({ error: 'Order not found !' });
        order.isValid = true;
        await order.save();
        mailController.sendConfirmation(order.client, order);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    register,
    login,
    validateOrder
}