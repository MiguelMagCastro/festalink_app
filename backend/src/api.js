require('dotenv').config();
const express = require('express');
const { openDatabase } = require('./db/init');
const { comporApi } = require('./composition');
const { criarAuthRoutes } = require('./routes/auth.routes');
const { criarSaloesRoutes } = require('./routes/saloes.routes');
const { criarReservasRoutes } = require('./routes/reservas.routes');
const { criarAvaliacoesRoutes } = require('./routes/avaliacoes.routes');
const { errorHandler } = require('./middleware/errorHandler');

async function main() {
  openDatabase();
  const ctx = comporApi();

  await ctx.infra.eventPublisher.iniciar();
  console.log(`api conectada ao broker (${process.env.EVENTOS_EXCHANGE || 'festalink.eventos'})`);

  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'festalink-api' });
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

  const port = Number(process.env.PORT || 3000);
  const servidor = app.listen(port, () => {
    console.log(`festalink api on :${port}`);
  });

  async function encerrar() {
    servidor.close();
    await ctx.infra.eventPublisher.fechar();
    process.exit(0);
  }

  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

main().catch((err) => {
  console.error('falha ao iniciar api:', err);
  process.exit(1);
});
