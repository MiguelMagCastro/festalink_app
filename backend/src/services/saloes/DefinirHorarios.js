const { HorarioFuncionamento } = require('../../domain/entities/HorarioFuncionamento');
const {
  DomainError,
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class DefinirHorarios {
  constructor({ salaoRepository, horarioRepository }) {
    this.salaoRepository = salaoRepository;
    this.horarioRepository = horarioRepository;
  }

  executar({ salaoId, prestadorId, horarios }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }
    if (!Array.isArray(horarios)) {
      throw new DomainError('horarios deve ser um array');
    }

    const entidades = horarios.map(h => new HorarioFuncionamento({
      salaoId,
      diaSemana: h.diaSemana,
      abreEm: h.abreEm,
      fechaEm: h.fechaEm,
    }));

    const diasVistos = new Set();
    for (const e of entidades) {
      if (diasVistos.has(e.diaSemana)) {
        throw new DomainError(`dia da semana duplicado: ${e.diaSemana}`);
      }
      diasVistos.add(e.diaSemana);
    }

    return this.horarioRepository.substituirGradeDoSalao(salaoId, entidades);
  }
}

module.exports = { DefinirHorarios };
