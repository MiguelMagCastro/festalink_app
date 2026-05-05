const { parseIntParam } = require('../utils/parseIntParam');

function reservaParaDTO(reserva) {
  return {
    id: reserva.id,
    clienteId: reserva.clienteId,
    salaoId: reserva.salaoId,
    dataEvento: reserva.dataEvento,
    horaInicio: reserva.horaInicio,
    horaFim: reserva.horaFim,
    status: reserva.status,
    criadoEm: reserva.criadoEm,
    atualizadoEm: reserva.atualizadoEm,
  };
}

class ReservaController {
  constructor({
    criarReserva,
    listarMinhasReservas,
    listarReservasRecebidas,
    aprovarReserva,
    recusarReserva,
    cancelarReserva,
  }) {
    this.criarReserva = criarReserva;
    this.listarMinhasReservas = listarMinhasReservas;
    this.listarReservasRecebidas = listarReservasRecebidas;
    this.aprovarReserva = aprovarReserva;
    this.recusarReserva = recusarReserva;
    this.cancelarReserva = cancelarReserva;
  }

  criar(req, res, next) {
    try {
      const reserva = this.criarReserva.executar({
        clienteId: req.usuario.id,
        dados: req.body || {},
      });
      return res.status(201).json(reservaParaDTO(reserva));
    } catch (err) {
      return next(err);
    }
  }

  minhas(req, res, next) {
    try {
      const lista = this.listarMinhasReservas.executar({ clienteId: req.usuario.id });
      return res.json(lista.map(reservaParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  recebidas(req, res, next) {
    try {
      const lista = this.listarReservasRecebidas.executar({ prestadorId: req.usuario.id });
      return res.json(lista.map(reservaParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  aprovar(req, res, next) {
    try {
      const reservaId = parseIntParam(req.params.id, 'reservaId');
      const reserva = this.aprovarReserva.executar({
        reservaId,
        prestadorId: req.usuario.id,
      });
      return res.json(reservaParaDTO(reserva));
    } catch (err) {
      return next(err);
    }
  }

  recusar(req, res, next) {
    try {
      const reservaId = parseIntParam(req.params.id, 'reservaId');
      const reserva = this.recusarReserva.executar({
        reservaId,
        prestadorId: req.usuario.id,
      });
      return res.json(reservaParaDTO(reserva));
    } catch (err) {
      return next(err);
    }
  }

  cancelar(req, res, next) {
    try {
      const reservaId = parseIntParam(req.params.id, 'reservaId');
      const reserva = this.cancelarReserva.executar({
        reservaId,
        usuarioId: req.usuario.id,
        papel: req.usuario.papel,
      });
      return res.json(reservaParaDTO(reserva));
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = { ReservaController };
