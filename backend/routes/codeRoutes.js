const express = require('express');
const router = express.Router();
const { execute } = require('../controllers/codeController');
const auth = require('../middlewares/authMiddleware');

router.post('/execute', auth, execute);

module.exports = router;
