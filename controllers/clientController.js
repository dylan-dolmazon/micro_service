const Client = require('../models/ClientSchema');

async function register(req, res) {
    try {
        const client = new Client({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password
        });
        console.log(client)
        await client.save();
        res.status(200).json(client);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function login(req, res) {
    try {
        const client = await Client.find({ email: req.body.email, password: req.body.password });
        res.status(200).json(client);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    register,
    login
}