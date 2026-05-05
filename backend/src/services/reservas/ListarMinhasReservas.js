class ListarMinhasReservas {
  constructor({ reservaRepository }) {
    this.reservaRepository = reservaRepository;
  }

  executar({ clienteId }) {
    return this.reservaRepository.listarPorCliente(clienteId);
  }
}

module.exports = { ListarMinhasReservas };
