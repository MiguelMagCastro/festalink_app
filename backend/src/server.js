require('dotenv').config();
const express = require('express');
const { openDatabase } = require('./db/init');
const { compor } = require('./composition');
const { criarAuthRoutes } = require('./routes/auth.routes');
const { criarSaloesRoutes } = require('./routes/saloes.routes');
const { criarReservasRoutes } = require('./routes/reservas.routes');
const { criarAvaliacoesRoutes } = require('./routes/avaliacoes.routes');
const { errorHandler } = require('./middleware/errorHandler');

openDatabase();
const ctx = compor();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'festalink-backend' });
});

app.use('/auth', criarAuthRoutes({
  authController: ctx.controllers.authController,
  autenticar: ctx.middlewares.autenticar,
}));

app.use('/saloes', criarSaloesRoutes({
  salaoController: ctx.controllers.salaoController,
  autenticar: ctx.middlewares.autenticar,
  exigirPapel: ctx.middlewares.exigirPapel,
}));

app.use('/reservas', criarReservasRoutes({
  reservaController: ctx.controllers.reservaController,
  autenticar: ctx.middlewares.autenticar,
  exigirPapel: ctx.middlewares.exigirPapel,
}));

app.use(criarAvaliacoesRoutes({
  avaliacaoController: ctx.controllers.avaliacaoController,
  autenticar: ctx.middlewares.autenticar,
  exigirPapel: ctx.middlewares.exigirPapel,
}));

app.use(errorHandler);

ctx.infra.wsNotifier.iniciar();

if (ctx.infra.eventConsumer) {
  ctx.infra.eventConsumer.iniciar()
    .then(() => console.log(`consumer redis ouvindo canal ${process.env.EVENTOS_CANAL || 'festalink:eventos'}`))
    .catch(err => console.error('falha ao iniciar consumer:', err.message));
} else {
  console.warn('REDIS_URL não definida: eventos desativados nesta execução');
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`festalink api on :${port}`);
});

function encerrar() {
  ctx.infra.wsNotifier.fechar();
  if (ctx.infra.eventPublisher) ctx.infra.eventPublisher.fechar().catch(() => {});
  if (ctx.infra.eventConsumer) ctx.infra.eventConsumer.fechar().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
