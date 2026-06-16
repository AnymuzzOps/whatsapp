const express = require('express');
const whatsappController = require('../controllers/whatsapp.controller');

const router = express.Router();

router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.receiveWebhook);

module.exports = router;
