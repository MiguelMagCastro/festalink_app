const Redis = require('ioredis');

class RedisEventPublisher {
  constructor({ url, canal }) {
    if (!url) {
      throw new Error('RedisEventPublisher: url obrigatória');
    }
    if (!canal) {
      throw new Error('RedisEventPublisher: canal obrigatório');
    }
    this.canal = canal;
    this.cliente = new Redis(url, { lazyConnect: false });
  }

  async publicar(evento) {
    const payload = JSON.stringify(evento);
    await this.cliente.publish(this.canal, payload);
  }

  async fechar() {
    await this.cliente.quit();
  }
}

module.exports = { RedisEventPublisher };
