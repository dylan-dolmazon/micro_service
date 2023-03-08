const Client = require('../models/ClientSchema');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

async function register(req, res) {
    if(req.body.password == undefined || req.body.email == undefined || req.body.name == undefined || req.body.phone == undefined)
      return res.status(400).json({ error: 'Missing parameters !' });
    try {
        let hash = await bcrypt.hash(req.body.password, 10);
        const client = new Client({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hash
        });
        let clientSave = await client.save();
        res.status(201).json(clientSave);
    }
    catch (error) {
        if(error.code === 11000)
            return res.status(409).json({ error: 'Email already exists !' });
        res.status(500).json({ message: error })
    }
}

async function login(req, res) {
    if(req.body.password == undefined || req.body.email == undefined)
      return res.status(400).json({ error: 'Missing parameters !' });
    try {
        let client = await Client.findOne({email: req.body.email})
        if(client===null){
            return res.status(404).json({ error: 'Invalid credentials !' });
        }

        let isCompare = await bcrypt.compare(req.body.password, client.password);
        if(!isCompare){
            return res.status(401).json({ error: 'Invalid credentials !' });
        }
        res.status(200).json({client: client, token: jwt.sign(
            { email: client.email },
            process.env.TOKEN_SECRET_CLIENT,
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