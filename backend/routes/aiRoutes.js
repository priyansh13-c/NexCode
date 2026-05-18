const express = require('express');
const router = express.Router();
const { evaluate } = require('../controllers/aiController');
const auth = require('../middlewares/authMiddleware');

router.post('/evaluate', auth, evaluate);

module.exports = router;
