const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para servir o certificado .p12
app.get('/certificado', (req, res) => {
  const certPath = path.join(__dirname, 'certificado.p12');
  if (fs.existsSync(certPath)) {
    res.download(certPath, 'certificado.p12');
  } else {
    res.status(404).send('Certificado não encontrado');
  }
});

// Rota para testar se o server está online
app.get('/', (req, res) => {
  res.send('Auth Token Server está rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
