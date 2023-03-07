const express = require('express');
const security = require('../auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/register',security.checkAdmin, adminController.register);
router.post('/login', adminController.login);

module.exports = router;