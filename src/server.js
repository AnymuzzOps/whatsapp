const express = require('express');
const env = require('./config/env');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use('/', whatsappRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bot-whatsapp-contable' });
});

app.use((error, req, res, next) => {
  console.error('Error no controlado en Express:', error.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(env.port, () => {
  console.log(`Bot de WhatsApp MyR Consultores escuchando en puerto ${env.port}`);
});
