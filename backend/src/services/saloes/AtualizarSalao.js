const { Salao } = require('../../domain/entities/Salao');
const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class AtualizarSalao {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar({ id, prestadorId, dados }) {
    const atual = this.salaoRepository.buscarPorId(id);
    if (!atual) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (atual.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }

    const merged = new Salao({
      ...atual,
      ...dados,
      id: atual.id,
      prestadorId: atual.prestadorId,
      criadoEm: atual.criadoEm,
      deletadoEm: atual.deletadoEm,
    });

    return this.salaoRepository.atualizar(merged);
  }
}

module.exports = { AtualizarSalao };
