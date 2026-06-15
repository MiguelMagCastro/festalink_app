const { ListarHorarios } = require('../../src/services/saloes/ListarHorarios');
const { ListarBloqueios } = require('../../src/services/saloes/ListarBloqueios');
const { Salao } = require('../../src/domain/entities/Salao');
const {
  AcessoNegadoError,
  RecursoNaoEncontradoError,
} = require('../../src/domain/errors/DomainError');

const salaoDoOutro = new Salao({
  id: 5, prestadorId: 10, nome: 'Espaço A', endereco: 'x',
  capacidadeMax: 50, valorDiaria: 1000,
});

describe('ListarHorarios (use case)', () => {
  test('devolve a grade do salão para qualquer interessado', () => {
    const horarios = [{ id: 1, salaoId: 5, diaSemana: 6, abreEm: '10:00', fechaEm: '23:00' }];
    const useCase = new ListarHorarios({
      salaoRepository: { buscarPorId: () => salaoDoOutro },
      horarioRepository: { listarPorSalao: jest.fn(() => horarios) },
    });
    expect(useCase.executar({ salaoId: 5 })).toBe(horarios);
  });

  test('lança 404 quando o salão não existe', () => {
    const useCase = new ListarHorarios({
      salaoRepository: { buscarPorId: () => null },
      horarioRepository: { listarPorSalao: () => [] },
    });
    expect(() => useCase.executar({ salaoId: 999 })).toThrow(RecursoNaoEncontradoError);
  });
});

describe('ListarBloqueios (use case)', () => {
  const bloqueios = [{ id: 1, salaoId: 5, data: '2026-07-01', horaInicio: '08:00', horaFim: '12:00', motivo: 'manutenção' }];

  test('leitura pública dispensa a checagem de dono', () => {
    const useCase = new ListarBloqueios({
      salaoRepository: { buscarPorId: () => salaoDoOutro },
      bloqueioRepository: { listarPorSalao: jest.fn(() => bloqueios) },
    });
    expect(useCase.executar({ salaoId: 5, publico: true })).toBe(bloqueios);
  });

  test('sem o modo público, exige que o prestador seja o dono', () => {
    const useCase = new ListarBloqueios({
      salaoRepository: { buscarPorId: () => salaoDoOutro },
      bloqueioRepository: { listarPorSalao: () => bloqueios },
    });
    expect(() => useCase.executar({ salaoId: 5, prestadorId: 999 })).toThrow(AcessoNegadoError);
    expect(useCase.executar({ salaoId: 5, prestadorId: 10 })).toBe(bloqueios);
  });

  test('lança 404 quando o salão não existe', () => {
    const useCase = new ListarBloqueios({
      salaoRepository: { buscarPorId: () => null },
      bloqueioRepository: { listarPorSalao: () => [] },
    });
    expect(() => useCase.executar({ salaoId: 999, publico: true })).toThrow(RecursoNaoEncontradoError);
  });
});
