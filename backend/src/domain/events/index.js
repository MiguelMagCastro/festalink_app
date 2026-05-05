const TIPOS = Object.freeze({
  RESERVA_SOLICITADA: 'ReservaSolicitada',
  RESERVA_APROVADA: 'ReservaAprovada',
  RESERVA_RECUSADA: 'ReservaRecusada',
});

function reservaSolicitada(reserva, agora = new Date()) {
  return {
    type: TIPOS.RESERVA_SOLICITADA,
    timestamp: agora.toISOString(),
    payload: {
      reservaId: reserva.id,
      salaoId: reserva.salaoId,
      clienteId: reserva.clienteId,
      dataEvento: reserva.dataEvento,
      horaInicio: reserva.horaInicio,
      horaFim: reserva.horaFim,
    },
  };
}

function reservaAprovada(reserva, agora = new Date()) {
  return {
    type: TIPOS.RESERVA_APROVADA,
    timestamp: agora.toISOString(),
    payload: {
      reservaId: reserva.id,
      salaoId: reserva.salaoId,
      clienteId: reserva.clienteId,
    },
  };
}

function reservaRecusada(reserva, agora = new Date()) {
  return {
    type: TIPOS.RESERVA_RECUSADA,
    timestamp: agora.toISOString(),
    payload: {
      reservaId: reserva.id,
      salaoId: reserva.salaoId,
      clienteId: reserva.clienteId,
    },
  };
}

module.exports = { TIPOS, reservaSolicitada, reservaAprovada, reservaRecusada };
