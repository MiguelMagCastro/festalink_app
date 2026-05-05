const { CancelarReserva } = require('../../src/services/reservas/CancelarReserva');
const { Reserva, STATUS_RESERVA } = require('../../src/domain/entities/Reserva');
const { Salao } = require('../../src/domain/entities/Salao');
const {
  DomainError,
  ConflitoEstadoError,
  AcessoNegadoError,
  RecursoNaoEncontradoError,
} = require('../../src/domain/errors/DomainError');

function dataFutura(diasNoFuturo) {
  return new Date(Date.now() + diasNoFuturo * 86400000).toISOString().slice(0, 10);
}

function reservaPara(diasNoFuturo, opts = {}) {
  return new Reserva({
    id: 1, clienteId: 2, salaoId: 5,
    dataEvento: dataFutura(diasNoFuturo),
    horaInicio: '19:00', horaFim: '22:00',
    status: STATUS_RESERVA.PENDENTE,
    ...opts,
  });
}

function montar({ reserva, salao = new Salao({ id: 5, prestadorId: 10, nome: 'A', endereco: 'x', capacidadeMax: 50, valorDiaria: 1000 }) } = {}) {
  return new CancelarReserva({
    reservaRepository: {
      buscarPorId: () => reserva,
      atualizar: jest.fn(r => r),
    },
    salaoRepository: {
      buscarPorId: () => salao,
    },
  });
}

describe('CancelarReserva (use case)', () => {
  describe('cliente cancelando', () => {
    test('cancela reserva pendente >48h', () => {
      const r = reservaPara(5);
      const useCase = montar({ reserva: r });
      useCase.executar({ reservaId: 1, usuarioId: 2, papel: 'cliente' });
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('rejeita quando faltam menos de 48h', () => {
      const r = reservaPara(1);
      const useCase = montar({ reserva: r });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 2, papel: 'cliente',
      })).toThrow(/48 horas/);
    });

    test('rejeita quando cliente é outro', () => {
      const r = reservaPara(5);
      const useCase = montar({ reserva: r });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 999, papel: 'cliente',
      })).toThrow(AcessoNegadoError);
    });
  });

  describe('prestador cancelando', () => {
    test('cancela reserva aprovada >48h', () => {
      const r = reservaPara(5, { status: STATUS_RESERVA.APROVADA });
      const useCase = montar({ reserva: r });
      useCase.executar({ reservaId: 1, usuarioId: 10, papel: 'prestador' });
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('rejeita quando faltam menos de 48h', () => {
      const r = reservaPara(1, { status: STATUS_RESERVA.APROVADA });
      const useCase = montar({ reserva: r });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 10, papel: 'prestador',
      })).toThrow(/48 horas/);
    });

    test('rejeita quando prestador não é dono do salão', () => {
      const r = reservaPara(5, { status: STATUS_RESERVA.APROVADA });
      const useCase = montar({ reserva: r });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 999, papel: 'prestador',
      })).toThrow(AcessoNegadoError);
    });

    test('rejeita quando salão foi arquivado (404 mensagem clara)', () => {
      const r = reservaPara(5, { status: STATUS_RESERVA.APROVADA });
      const useCase = new CancelarReserva({
        reservaRepository: { buscarPorId: () => r, atualizar: () => r },
        salaoRepository: { buscarPorId: () => null },
      });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 10, papel: 'prestador',
      })).toThrow(RecursoNaoEncontradoError);
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 10, papel: 'prestador',
      })).toThrow(/não está mais disponível/);
    });
  });

  describe('reserva inexistente', () => {
    test('lança 404 antes de qualquer outra checagem', () => {
      const useCase = new CancelarReserva({
        reservaRepository: { buscarPorId: () => null, atualizar: () => {} },
        salaoRepository: { buscarPorId: () => null },
      });
      expect(() => useCase.executar({
        reservaId: 999, usuarioId: 2, papel: 'cliente',
      })).toThrow(RecursoNaoEncontradoError);
    });
  });

  describe('papel inválido', () => {
    test('lança DomainError', () => {
      const r = reservaPara(5);
      const useCase = montar({ reserva: r });
      expect(() => useCase.executar({
        reservaId: 1, usuarioId: 2, papel: 'admin',
      })).toThrow(DomainError);
    });
  });
});
