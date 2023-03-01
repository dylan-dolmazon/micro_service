const express = require('express');

const clientController = require('../controllers/clientController');

const router = express.Router();

router.post('/register', clientController.register);
router.post('/login', clientController.login);

module.exports = router;