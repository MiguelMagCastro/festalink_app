const Redis = require('ioredis');

class RedisEventConsumer {
  constructor({ url, canal, onEvento }) {
    if (!url) {
      throw new Error('RedisEventConsumer: url obrigatória');
    }
    if (!canal) {
      throw new Error('RedisEventConsumer: canal obrigatório');
    }
    if (typeof onEvento !== 'function') {
      throw new Error('RedisEventConsumer: onEvento deve ser função');
    }
    this.canal = canal;
    this.onEvento = onEvento;
    this.cliente = new Redis(url, { lazyConnect: false });
  }

  async iniciar() {
    await this.cliente.subscribe(this.canal);
    this.cliente.on('message', (canal, raw) => {
      if (canal !== this.canal) return;
      let evento;
      try {
        evento = JSON.parse(raw);
      } catch (_e) {
        return;
      }
      Promise.resolve()
        .then(() => this.onEvento(evento))
        .catch(err => {
          console.error('[consumer] erro ao processar evento:', err.message);
        });
    });
  }

  async fechar() {
    await this.cliente.quit();
  }
}

module.exports = { RedisEventConsumer };
