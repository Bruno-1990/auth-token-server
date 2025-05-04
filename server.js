const express = require('express');
const fs = require('fs');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Tenta carregar o certificado
let certificado;
try {
  certificado = fs.readFileSync('certificado.p12');
  console.log('Certificado carregado com sucesso.');
} catch (error) {
  console.error('Erro ao carregar o certificado.p12:', error.message);
  certificado = null;
}

// Configurações
const certPassword = process.env.CERT_PASSWORD;
const authorizationBase64 = process.env.AUTHORIZATION_BASE64;

// Rota principal
app.post('/get-token', (req, res) => {
  try {
    if (!certificado) {
      return res.status(500).json({ error: 'Certificado não encontrado no servidor.' });
    }

    const payload = { auth: true };
    const token = jwt.sign(payload, 'chave-secreta', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Porta dinâmica para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
