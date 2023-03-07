const Client = require('../models/ClientSchema');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

async function register(req, res) {
    try {
        let hash = await bcrypt.hash(req.body.password, 10);
        const client = new Client({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hash
        });
        let clientSave = await client.save();
        console.log('clientSave: ', clientSave);
        res.status(200).json(clientSave);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function login(req, res) {
    try {
        let client = await Client.findOne({email: req.body.email})
        if(client===null)
            return res.status(404).json({ error: 'Client not found !' });
        let isCompare = await bcrypt.compare(req.body.password, client.password);
        if(!isCompare)
            return res.status(401).json({ error: 'Wrong password !' });
        res.status(200).json({client: client, token: jwt.sign(
            { email: client.email },
            'clientsdgkh56k46g723sq568etfgfd3sgfdy5s7q564f2T',
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