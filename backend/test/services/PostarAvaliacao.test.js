const { PostarAvaliacao } = require('../../src/services/avaliacoes/PostarAvaliacao');
const { Reserva, STATUS_RESERVA } = require('../../src/domain/entities/Reserva');
const { Salao } = require('../../src/domain/entities/Salao');
const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
  ConflitoEstadoError,
} = require('../../src/domain/errors/DomainError');

function reservaConcluida() {
  return new Reserva({
    id: 1, clienteId: 2, salaoId: 5,
    dataEvento: '2026-01-01', horaInicio: '19:00', horaFim: '22:00',
    status: STATUS_RESERVA.APROVADA,
  });
}

function salaoAtivo() {
  return new Salao({
    id: 5, prestadorId: 10, nome: 'A', endereco: 'x',
    capacidadeMax: 50, valorDiaria: 1000,
  });
}

function montar({
  reserva = reservaConcluida(),
  salao = salaoAtivo(),
  avaliacaoExistente = null,
} = {}) {
  const criada = jest.fn(a => Object.assign({}, a, { id: 7 }));
  const useCase = new PostarAvaliacao({
    reservaRepository: { buscarPorId: () => reserva },
    avaliacaoRepository: {
      buscarPorReservaId: () => avaliacaoExistente,
      criar: criada,
    },
    salaoRepository: { buscarPorId: () => salao },
  });
  return { useCase, criada };
}

describe('PostarAvaliacao (use case)', () => {
  test('cria avaliação quando reserva está concluída e cliente é dono', () => {
    const { useCase, criada } = montar();
    const a = useCase.executar({
      reservaId: 1, clienteId: 2, dados: { nota: 5, comentario: 'top' },
    });
    expect(a.id).toBe(7);
    expect(criada).toHaveBeenCalledTimes(1);
  });

  test('rejeita quando reserva não existe', () => {
    const useCase = new PostarAvaliacao({
      reservaRepository: { buscarPorId: () => null },
      avaliacaoRepository: { buscarPorReservaId: () => null, criar: () => {} },
      salaoRepository: { buscarPorId: () => null },
    });
    expect(() => useCase.executar({
      reservaId: 999, clienteId: 2, dados: { nota: 5 },
    })).toThrow(RecursoNaoEncontradoError);
  });

  test('rejeita quando cliente não é dono da reserva', () => {
    const { useCase } = montar();
    expect(() => useCase.executar({
      reservaId: 1, clienteId: 999, dados: { nota: 5 },
    })).toThrow(AcessoNegadoError);
  });

  test('rejeita com mensagem clara quando salão foi arquivado', () => {
    const useCase = new PostarAvaliacao({
      reservaRepository: { buscarPorId: () => reservaConcluida() },
      avaliacaoRepository: { buscarPorReservaId: () => null, criar: () => {} },
      salaoRepository: { buscarPorId: () => null },
    });
    expect(() => useCase.executar({
      reservaId: 1, clienteId: 2, dados: { nota: 5 },
    })).toThrow(/não está mais disponível/);
  });

  test('rejeita quando reserva não está concluída', () => {
    const r = new Reserva({
      id: 1, clienteId: 2, salaoId: 5,
      dataEvento: '2099-01-01', horaInicio: '19:00', horaFim: '22:00',
      status: STATUS_RESERVA.APROVADA,
    });
    const { useCase } = montar({ reserva: r });
    expect(() => useCase.executar({
      reservaId: 1, clienteId: 2, dados: { nota: 5 },
    })).toThrow(/ainda não pode ser avaliada/);
  });

  test('rejeita quando reserva está pendente', () => {
    const r = new Reserva({
      id: 1, clienteId: 2, salaoId: 5,
      dataEvento: '2026-01-01', horaInicio: '19:00', horaFim: '22:00',
      status: STATUS_RESERVA.PENDENTE,
    });
    const { useCase } = montar({ reserva: r });
    expect(() => useCase.executar({
      reservaId: 1, clienteId: 2, dados: { nota: 5 },
    })).toThrow(ConflitoEstadoError);
  });

  test('rejeita quando já existe avaliação para a reserva', () => {
    const { useCase } = montar({ avaliacaoExistente: { id: 99 } });
    expect(() => useCase.executar({
      reservaId: 1, clienteId: 2, dados: { nota: 5 },
    })).toThrow(/já tem avaliação/);
  });
});
