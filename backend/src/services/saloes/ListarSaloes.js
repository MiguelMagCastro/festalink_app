class ListarSaloes {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar() {
    return this.salaoRepository.listarTodos();
  }
}

module.exports = { ListarSaloes };
