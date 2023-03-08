const Admin = require('../models/adminSchema');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

require('dotenv').config();

async function register(req, res) {
    if(req.body.password == undefined || req.body.email == undefined)
      return res.status(400).json({ error: 'Missing parameters !' });
    try {
        let hash = await bcrypt.hash(req.body.password, 10);
        const admin = new Admin({
            email: req.body.email,
            password: hash
        });
        let adminSave = await admin.save();
        res.status(201).json(adminSave);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function login(req, res) {
    if(req.body.password == undefined || req.body.email == undefined)
      return res.status(400).json({ error: 'Missing parameters !' });
    try {
        let admin = await Admin.findOne({email: req.body.email})
        if(admin===null){
            return res.status(404).json({ error: 'Admin not found !' });
        }
        let isCompare = await bcrypt.compare(req.body.password, admin.password);
        if(!isCompare){
            return res.status(401).json({ error: 'Wrong password !' });
        }
        res.status(200).json({admin: admin, token: jwt.sign(
            { email: admin.email },
            process.env.TOKEN_SECRET_ADMIN,
            { expiresIn: '24h' }
        )});
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    register,
    login
}