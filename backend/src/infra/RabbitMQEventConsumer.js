const amqp = require('amqplib');

class RabbitMQEventConsumer {
  constructor({ url, exchange, fila, routingKeys, onEvento }) {
    if (!url) {
      throw new Error('RabbitMQEventConsumer: url obrigatória');
    }
    if (!exchange) {
      throw new Error('RabbitMQEventConsumer: exchange obrigatório');
    }
    if (!fila) {
      throw new Error('RabbitMQEventConsumer: fila obrigatória');
    }
    if (!Array.isArray(routingKeys) || routingKeys.length === 0) {
      throw new Error('RabbitMQEventConsumer: routingKeys deve ser array não vazio');
    }
    if (typeof onEvento !== 'function') {
      throw new Error('RabbitMQEventConsumer: onEvento deve ser função');
    }
    this.url = url;
    this.exchange = exchange;
    this.fila = fila;
    this.routingKeys = routingKeys;
    this.onEvento = onEvento;
    this.connection = null;
    this.channel = null;
  }

  async iniciar() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.fila, { durable: true });
    for (const chave of this.routingKeys) {
      await this.channel.bindQueue(this.fila, this.exchange, chave);
    }
    await this.channel.prefetch(1);
    await this.channel.consume(this.fila, (msg) => this._processar(msg));
  }

  async _processar(msg) {
    if (!msg) return;
    let evento;
    try {
      evento = JSON.parse(msg.content.toString('utf8'));
    } catch (_e) {
      this.channel.nack(msg, false, false);
      return;
    }
    try {
      await this.onEvento(evento);
      this.channel.ack(msg);
    } catch (err) {
      console.error('[consumer] erro ao processar evento:', err.message);
      this.channel.nack(msg, false, true);
    }
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

module.exports = { RabbitMQEventConsumer };
