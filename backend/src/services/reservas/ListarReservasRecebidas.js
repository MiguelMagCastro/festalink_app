class ListarReservasRecebidas {
  constructor({ reservaRepository }) {
    this.reservaRepository = reservaRepository;
  }

  executar({ prestadorId }) {
    return this.reservaRepository.listarPorPrestador(prestadorId);
  }
}

module.exports = { ListarReservasRecebidas };
