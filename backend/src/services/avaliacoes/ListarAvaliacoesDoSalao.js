const { RecursoNaoEncontradoError } = require('../../domain/errors/DomainError');

class ListarAvaliacoesDoSalao {
  constructor({ salaoRepository, avaliacaoRepository }) {
    this.salaoRepository = salaoRepository;
    this.avaliacaoRepository = avaliacaoRepository;
  }

  executar({ salaoId }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    return this.avaliacaoRepository.listarPorSalao(salaoId);
  }
}

module.exports = { ListarAvaliacoesDoSalao };
