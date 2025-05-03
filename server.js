const express = require('express');
const fs = require('fs');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Carrega o certificado
const certificado = fs.readFileSync('certificado.p12');

// Configurações
const certPassword = process.env.CERT_PASSWORD;
const authorizationBase64 = process.env.AUTHORIZATION_BASE64;

// Rota principal
app.post('/get-token', (req, res) => {
  try {
    // Aqui você adiciona sua lógica de autenticação usando o certificado
    // Este é só um exemplo simplificado de resposta
    const payload = { auth: true };
    const token = jwt.sign(payload, 'chave-secreta', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Porta dinâmica: usa a variável do Railway (PORT) ou 3000 localmente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
