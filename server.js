const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');

const app = express();
app.use(express.json());

// Carregar o certificado a partir da variável de ambiente
let certificado;
try {
  if (process.env.CERTIFICADO_P12_BASE64) {
    certificado = Buffer.from(process.env.CERTIFICADO_P12_BASE64, 'base64');
    console.log('Certificado carregado do Base64.');
  } else {
    console.error('Variável CERTIFICADO_P12_BASE64 não encontrada.');
    certificado = null;
  }
} catch (error) {
  console.error('Erro ao carregar o certificado Base64:', error.message);
  certificado = null;
}

// Configurações
const certPassword = process.env.CERT_PASSWORD;
const authorizationBase64 = process.env.AUTHORIZATION_BASE64;

// Rota principal
app.post('/get-token', (req, res) => {
  try {
    if (!certificado) {
      return res.status(500).json({ error: 'Certificado não carregado no servidor.' });
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
