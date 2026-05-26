require('dotenv').config();
const { openDatabase } = require('./db/init');
const { comporWorker } = require('./composition');

async function main() {
  openDatabase();
  const ctx = comporWorker();

  ctx.infra.wsNotifier.iniciar();

  await ctx.infra.eventConsumer.iniciar();
  console.log(`worker consumindo fila ${process.env.EVENTOS_FILA_WORKER || 'festalink.worker'}`);

  async function encerrar() {
    await ctx.infra.eventConsumer.fechar();
    ctx.infra.wsNotifier.fechar();
    process.exit(0);
  }

  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

main().catch((err) => {
  console.error('falha ao iniciar worker:', err);
  process.exit(1);
});
