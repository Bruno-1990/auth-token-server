<div align="center">

# 🔐 auth-token-server

**Microserviço Express que autentica na API do SERPRO usando certificado digital (.p12/PFX) e retorna o token de acesso.**

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)
![Status](https://img.shields.io/badge/status-MVP-orange)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Rodar](#-como-rodar)
- [Endpoints](#-endpoints)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy](#-deploy)
- [Resumo Técnico](#-resumo-técnico)
- [Licença](#-licença)

---

## 🧐 Sobre

O **auth-token-server** é um microserviço HTTP simples cuja única responsabilidade é
obter um **token de acesso (OAuth2 `client_credentials`)** junto à API de autenticação
do **SERPRO** (`autenticacao.sapi.serpro.gov.br`).

A autenticação é feita via **certificado digital no formato PFX/.p12** (mTLS), cujo
conteúdo é fornecido em **Base64** através de variáveis de ambiente — formato ideal
para deploy em plataformas como **Railway**, **Render** ou **Heroku**, que não
persistem arquivos no filesystem.

Ao receber uma requisição em `GET /serpro/token`, o serviço monta o agente HTTPS com
o certificado, chama o SERPRO e devolve a resposta original da API (que inclui o
`access_token`).

---

## 🛠 Stack Tecnológica

| Camada            | Tecnologia            |
|-------------------|-----------------------|
| Runtime           | Node.js (>= 18)       |
| Servidor HTTP     | Express 4.18          |
| Cliente HTTP      | Axios 1.6             |
| Config / Secrets  | dotenv 16             |
| TLS / mTLS        | módulo nativo `https` |

---

## 🏗 Arquitetura

Aplicação **monolítica de arquivo único** (`index.js`), sem camadas adicionais.
Fluxo da requisição:

```
Cliente ──GET /serpro/token──▶ auth-token-server
                                     │
                                     │ monta https.Agent com PFX (Base64 → Buffer)
                                     │ envia grant_type=client_credentials
                                     ▼
                          SERPRO  /authenticate  (mTLS + Authorization)
                                     │
                                     ▼
              { access_token, token_type, expires_in, ... } ──▶ Cliente
```

---

## 📁 Estrutura do Projeto

```
auth-token-server/
├── index.js        # Servidor Express + rota de autenticação SERPRO
├── package.json    # Metadados e dependências
└── .gitignore      # Ignora .env e node_modules
```

---

## ⚙️ Pré-requisitos

- **Node.js >= 18**
- Certificado digital **e-CNPJ/e-CPF** válido no formato **.p12 / .pfx**
- Credenciais de acesso à API do SERPRO (string `Authorization` em Base64)

---

## 🚀 Instalação

```bash
git clone https://github.com/Bruno-1990/auth-token-server.git
cd auth-token-server
npm install
```

---

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

| Variável                  | Obrigatória | Default      | Descrição                                                        |
|---------------------------|:-----------:|--------------|------------------------------------------------------------------|
| `CERTIFICADO_P12_BASE64`  |     ✅      | —            | Conteúdo do certificado `.p12`/`.pfx` codificado em Base64       |
| `CERT_PASSWORD`           |     ✅      | —            | Senha (passphrase) do certificado                                |
| `AUTHORIZATION_BASE64`    |     ✅      | —            | Header `Authorization` (Basic Base64) fornecido pelo SERPRO      |
| `ROLE_TYPE`               |     ❌      | `TERCEIROS`  | Tipo de papel enviado no header `Role-Type`                      |
| `PORT`                    |     ❌      | `3000`       | Porta em que o servidor escuta                                   |

> 💡 Para gerar o Base64 do certificado:
> ```bash
> base64 -w 0 certificado.p12        # Linux
> certutil -encode certificado.p12 cert.b64   # Windows
> ```

---

## ▶️ Como Rodar

### Desenvolvimento / Produção

```bash
npm start
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

---

## 📡 Endpoints

### `GET /serpro/token`

Obtém um token de acesso na API do SERPRO.

**Respostas:**

| Status | Corpo                                              | Quando                                          |
|:------:|----------------------------------------------------|-------------------------------------------------|
| `200`  | Resposta original do SERPRO (inclui `access_token`)| Autenticação bem-sucedida                       |
| `400`  | `{ "error": "Variáveis de ambiente faltando" }`    | Falta `CERTIFICADO_P12_BASE64`, `CERT_PASSWORD` ou `AUTHORIZATION_BASE64` |
| `500`  | `{ "error": "Falha na autenticação com o Serpro" }`| Erro na chamada ao SERPRO                        |

**Exemplo:**

```bash
curl http://localhost:3000/serpro/token
```

---

## 📜 Scripts Disponíveis

| Script  | Comando          | Descrição                  |
|---------|------------------|----------------------------|
| `start` | `node index.js`  | Inicia o servidor Express  |

---

## 🚢 Deploy

O projeto está hospedado no **[Railway](https://railway.com)**, com **deploy
automático** a cada `push` na branch `main`.

**Endpoint de produção:**

```
https://auth-token-server-production-ce0e.up.railway.app/serpro/token
```

```bash
curl https://auth-token-server-production-ce0e.up.railway.app/serpro/token
```

### Como funciona o deploy

1. As variáveis de ambiente são configuradas no painel do serviço no Railway
   (incluindo o certificado em Base64 — **nunca** suba o arquivo `.p12` para o repositório).
2. A cada push na `main`, o Railway executa `npm install` e em seguida `npm start`.
3. A porta é lida de `process.env.PORT`, atribuída automaticamente pelo Railway.

> O mesmo processo funciona em outras plataformas PaaS (Render, Heroku, Fly.io),
> bastando replicar as variáveis de ambiente.

---

## 📌 Resumo Técnico

### Pontos Fortes

- **Simplicidade**: responsabilidade única e código enxuto, fácil de auditar.
- **Secrets via ambiente**: certificado em Base64 permite deploy sem arquivos no disco.
- **mTLS nativo**: usa o módulo `https` do Node, sem dependências pesadas de TLS.
- **Tratamento de erros** com mensagens claras e log no servidor.

### Riscos Técnicos

- **Sem testes automatizados** — adicionar testes (Jest/Supertest) para a rota.
- **Sem cache de token** — cada requisição chama o SERPRO; considerar cachear o token até `expires_in`.
- **Sem `.env.example`** — incluir um modelo para facilitar onboarding.
- **Sem rate limiting / autenticação no próprio endpoint** — qualquer cliente que acesse a URL obtém um token; proteger com chave de API ou rede privada.
- **Sem health check** — adicionar `GET /health` para readiness/liveness em produção.

### Maturidade do Projeto

| Dimensão              | Nível | Observação                                            |
|-----------------------|:-----:|-------------------------------------------------------|
| Cobertura de testes   |   1   | Nenhum teste presente                                 |
| Documentação          |   3   | Este README; código sem comentários                   |
| Qualidade do código   |   3   | Limpo e legível, mas sem lint configurado             |
| Segurança             |   2   | Secrets via env ok, porém endpoint sem proteção       |
| Observabilidade       |   2   | Apenas `console.log`/`console.error`, sem métricas     |
| Escalabilidade        |   3   | Stateless; ganharia com cache de token                |

> Escala: 1 = Inexistente · 3 = Adequado · 5 = Excelente

---

## 📄 Licença

`ISC` (padrão npm — não há arquivo `LICENSE` no repositório).

---

<div align="center">
Gerado com ❤️ por análise técnica automatizada
</div>
