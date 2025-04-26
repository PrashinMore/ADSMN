const express = require('express');
const scoreController = require('../controllers/scoreController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/save', scoreController.saveScore);
router.post('/card', scoreController.getScoreCard);

module.exports = router;