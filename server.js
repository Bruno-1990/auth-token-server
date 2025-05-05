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
const PORT = process.env.PORT || 3000;

// Rota principal
app.post('/get-token', async (req, res) => {
  if (!certificado) {
    return res.status(500).json({ error: 'Certificado não carregado no servidor.' });
  }

  const tempCertPath = '/tmp/certificado.p12';

  try {
    // Salvar certificado temporariamente
    fs.writeFileSync(tempCertPath, certificado);

    // Criar o HTTPS Agent
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
          'Authorization': `Basic ${authorizationBase64}`,
          'Role-Type': 'TERCEIROS',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Retornar o token recebido
    return res.status(200).json({
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
    });

  } catch (error) {
    console.error('Erro ao obter token do SERPRO:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Erro ao obter token do SERPRO',
      details: error.response?.data || error.message,
    });
  } finally {
    // Limpar o arquivo temporário
    if (fs.existsSync(tempCertPath)) {
      fs.unlinkSync(tempCertPath);
      console.log('Certificado temporário removido.');
    }
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
