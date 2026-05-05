class ListarMeusSaloes {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar({ prestadorId }) {
    return this.salaoRepository.listarPorPrestador(prestadorId);
  }
}

module.exports = { ListarMeusSaloes };
