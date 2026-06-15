const { RecursoNaoEncontradoError } = require('../../domain/errors/DomainError');

class ListarHorarios {
  constructor({ salaoRepository, horarioRepository }) {
    this.salaoRepository = salaoRepository;
    this.horarioRepository = horarioRepository;
  }

  executar({ salaoId }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    return this.horarioRepository.listarPorSalao(salaoId);
  }
}

module.exports = { ListarHorarios };
