const amqp = require('amqplib');

function tipoParaRoutingKey(type) {
  return String(type)
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .toLowerCase();
}

class RabbitMQEventPublisher {
  constructor({ url, exchange }) {
    if (!url) {
      throw new Error('RabbitMQEventPublisher: url obrigatória');
    }
    if (!exchange) {
      throw new Error('RabbitMQEventPublisher: exchange obrigatório');
    }
    this.url = url;
    this.exchange = exchange;
    this.connection = null;
    this.channel = null;
  }

  async iniciar() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
  }

  async publicar(evento) {
    if (!this.channel) {
      throw new Error('RabbitMQEventPublisher: chame iniciar() antes de publicar');
    }
    const routingKey = tipoParaRoutingKey(evento.type);
    const payload = Buffer.from(JSON.stringify(evento));
    await new Promise((resolve, reject) => {
      this.channel.publish(
        this.exchange,
        routingKey,
        payload,
        { persistent: true, contentType: 'application/json' },
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async fechar() {
    if (this.channel) {
      try { await this.channel.close(); } catch (_e) {}
      this.channel = null;
    }
    if (this.connection) {
      try { await this.connection.close(); } catch (_e) {}
      this.connection = null;
    }
  }
}

module.exports = { RabbitMQEventPublisher, tipoParaRoutingKey };
