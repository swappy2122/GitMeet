const express = require('express');
const router = express.Router();
const authController = require('../authController');

router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);
router.get('/logout', authController.logout);

module.exports = router;
