const express = require('express');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/serpro/token', async (req, res) => {
  try {
    const certBase64 = process.env.CERTIFICADO_P12_BASE64;
    const certPassword = process.env.CERT_PASSWORD;
    const authorization = process.env.AUTHORIZATION_BASE64;
    const roleType = process.env.ROLE_TYPE || 'TERCEIROS';

    if (!certBase64 || !certPassword || !authorization) {
      return res.status(400).json({ error: 'Variáveis de ambiente faltando' });
    }

    const certBuffer = Buffer.from(certBase64, 'base64');

    const httpsAgent = new https.Agent({
      pfx: certBuffer,
      passphrase: certPassword,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authorization,
      'Role-Type': roleType,
    };

    const body = new URLSearchParams({ grant_type: 'client_credentials' });

    const response = await axios.post(
      'https://autenticacao.sapi.serpro.gov.br/authenticate',
      body,
      { headers, httpsAgent }
    );

    return res.json(response.data);

  } catch (error) {
    console.error('Erro na autenticação com o Serpro:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Falha na autenticação com o Serpro' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
