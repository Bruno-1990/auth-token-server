const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
require('dotenv').config();

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

// Rota principal corrigida
app.post('/get-token', async (req, res) => {
  try {
    if (!certificado) {
      return res.status(500).json({ error: 'Certificado não carregado no servidor.' });
    }

    // Salvar o certificado temporariamente (em memória ou em /tmp)
    const tempCertPath = '/tmp/certificado.p12';
    fs.writeFileSync(tempCertPath, certificado);

    // Criar o agent HTTPS usando o certificado
    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(tempCertPath),
      passphrase: certPassword,
    });

    // Fazer o POST para o SERPRO
    const response = await axios.post(
      'https://autenticacao.sapi.serpro.gov.br/authenticate',
      'grant_type=client_credentials',
      {
        httpsAgent,
        headers: {
          'Authorization': authorizationBase64,
          'Role-Type': 'TERCEIROS',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Retornar o token real do SERPRO
    res.json({
      token: response.data.access_token,
    });
  } catch (error) {
    console.error('Erro ao obter token do SERPRO:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter token do SERPRO' });
  }
});

// Porta dinâmica para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
