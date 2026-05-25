const { WebSocketServer } = require('ws');

class WebSocketNotifier {
  constructor({ porta, tokenService, salaoRepository }) {
    if (!porta) {
      throw new Error('WebSocketNotifier: porta obrigatória');
    }
    if (!tokenService) {
      throw new Error('WebSocketNotifier: tokenService obrigatório');
    }
    if (!salaoRepository) {
      throw new Error('WebSocketNotifier: salaoRepository obrigatório');
    }
    this.porta = porta;
    this.tokenService = tokenService;
    this.salaoRepository = salaoRepository;
    this.conexoesPorPrestador = new Map();
    this.servidor = null;
  }

  iniciar() {
    this.servidor = new WebSocketServer({ port: this.porta });
    this.servidor.on('connection', (socket, req) => this._aoConectar(socket, req));
    console.log(`websocket aberto em :${this.porta}`);
  }

  _aoConectar(socket, req) {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) {
      socket.close(4001, 'token ausente');
      return;
    }
    let payload;
    try {
      payload = this.tokenService.verificar(token);
    } catch (_e) {
      socket.close(4001, 'token inválido');
      return;
    }
    if (payload.papel !== 'prestador') {
      socket.close(4003, 'apenas prestadores recebem notificações');
      return;
    }
    const prestadorId = payload.sub;
    this._registrar(prestadorId, socket);
    socket.send(JSON.stringify({ type: 'Conectado', prestadorId }));
    socket.on('close', () => this._remover(prestadorId, socket));
  }

  _registrar(prestadorId, socket) {
    if (!this.conexoesPorPrestador.has(prestadorId)) {
      this.conexoesPorPrestador.set(prestadorId, new Set());
    }
    this.conexoesPorPrestador.get(prestadorId).add(socket);
  }

  _remover(prestadorId, socket) {
    const conjunto = this.conexoesPorPrestador.get(prestadorId);
    if (!conjunto) return;
    conjunto.delete(socket);
    if (conjunto.size === 0) {
      this.conexoesPorPrestador.delete(prestadorId);
    }
  }

  notificarPrestadorDoSalao(salaoId, evento) {
    const salao = this.salaoRepository.buscarPorIdIncluindoArquivado(salaoId);
    if (!salao) return 0;
    return this.notificarPrestador(salao.prestadorId, evento);
  }

  notificarPrestador(prestadorId, evento) {
    const conjunto = this.conexoesPorPrestador.get(prestadorId);
    if (!conjunto || conjunto.size === 0) return 0;
    const payload = JSON.stringify(evento);
    let enviados = 0;
    for (const socket of conjunto) {
      if (socket.readyState === socket.OPEN) {
        socket.send(payload);
        enviados += 1;
      }
    }
    return enviados;
  }

  fechar() {
    if (this.servidor) {
      this.servidor.close();
    }
  }
}

module.exports = { WebSocketNotifier };
