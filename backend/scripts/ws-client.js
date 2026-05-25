require('dotenv').config();
const WebSocket = require('ws');

const token = process.argv[2] || process.env.WS_TOKEN;
const host = process.env.WS_HOST || '127.0.0.1';
const porta = process.env.WS_PORT || 3001;

if (!token) {
  console.error('uso: node scripts/ws-client.js <jwt-do-prestador>');
  console.error('ou defina WS_TOKEN no .env');
  process.exit(1);
}

const url = `ws://${host}:${porta}/?token=${encodeURIComponent(token)}`;
console.log(`conectando em ${url}`);

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('conectado, aguardando eventos...');
});

ws.on('message', raw => {
  const texto = raw.toString();
  try {
    const evento = JSON.parse(texto);
    console.log(new Date().toISOString(), '<<', JSON.stringify(evento, null, 2));
  } catch (_e) {
    console.log(new Date().toISOString(), '<<', texto);
  }
});

ws.on('close', (code, reason) => {
  console.log(`conexão fechada: ${code} ${reason.toString()}`);
  process.exit(0);
});

ws.on('error', err => {
  console.error('erro:', err.message);
});

process.on('SIGINT', () => {
  ws.close();
});
