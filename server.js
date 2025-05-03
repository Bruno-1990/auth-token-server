// server.js atualizado para rodar na porta do Railway automaticamente

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Porta fornecida pelo Railway ou 3000 localmente

app.use(bodyParser.json());

app.post('/get-certificado', (req, res) => {
    const { authorizationBase64, certPassword } = req.body;

    if (!authorizationBase64 || !certPassword) {
        return res.status(400).json({ error: 'authorizationBase64 e certPassword são obrigatórios' });
    }

    const certPath = path.join(__dirname, 'certificado.p12');

    try {
        const certFile = fs.readFileSync(certPath);
        const certBase64 = certFile.toString('base64');

        res.json({
            authorizationBase64,
            certPassword,
            certificadoBase64: certBase64
        });
    } catch (error) {
        console.error('Erro ao ler o certificado:', error);
        res.status(500).json({ error: 'Erro ao ler o certificado.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
