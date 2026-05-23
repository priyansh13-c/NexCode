const express = require('express');
const router = express.Router();
const { evaluate, history, interview } = require('../controllers/aiController');
const auth = require('../middlewares/authMiddleware');

router.post('/evaluate', auth, evaluate);
router.get('/history', auth, history);
router.post('/interview', auth, interview);

module.exports = router;
