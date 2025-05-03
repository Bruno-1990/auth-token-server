const express = require('express');
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/get-token', (req, res) => {
  const cert = fs.readFileSync('./certificado.p12');
  const certPassword = process.env.CERT_PASSWORD;

  const postData = querystring.stringify({
    grant_type: 'client_credentials'
  });

  const options = {
    hostname: 'autenticacao.sapi.serpro.gov.br',
    port: 443,
    path: '/authenticate',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.AUTHORIZATION_BASE64}`,
      'Role-Type': 'TERCEIROS',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    },
    pfx: cert,
    passphrase: certPassword
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      res.status(response.statusCode).send(data);
    });
  });

  request.on('error', (e) => {
    console.error(e);
    res.status(500).send('Error: ' + e.message);
  });

  request.write(postData);
  request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
