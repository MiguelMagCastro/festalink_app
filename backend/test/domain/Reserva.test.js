const { Reserva, STATUS_RESERVA } = require('../../src/domain/entities/Reserva');
const { DomainError, ConflitoEstadoError } = require('../../src/domain/errors/DomainError');

function dataFormatada(date) {
  return date.toISOString().slice(0, 10);
}

function reservaPara(diasNoFuturo, horaInicio = '19:00', horaFim = '22:00', overrides = {}) {
  const data = dataFormatada(new Date(Date.now() + diasNoFuturo * 86400000));
  return new Reserva({
    clienteId: 1,
    salaoId: 1,
    dataEvento: data,
    horaInicio,
    horaFim,
    ...overrides,
  });
}

describe('Reserva', () => {
  describe('construção', () => {
    test('aceita dados válidos com status default pendente', () => {
      const r = reservaPara(5);
      expect(r.status).toBe(STATUS_RESERVA.PENDENTE);
    });

    test('rejeita dataEvento fora do formato', () => {
      expect(() => new Reserva({
        clienteId: 1, salaoId: 1, dataEvento: '25/12/2026',
        horaInicio: '19:00', horaFim: '22:00',
      })).toThrow(DomainError);
    });

    test('rejeita horaInicio depois de horaFim', () => {
      expect(() => new Reserva({
        clienteId: 1, salaoId: 1, dataEvento: '2026-12-25',
        horaInicio: '22:00', horaFim: '19:00',
      })).toThrow(DomainError);
    });

    test('rejeita status inválido', () => {
      expect(() => new Reserva({
        clienteId: 1, salaoId: 1, dataEvento: '2026-12-25',
        horaInicio: '19:00', horaFim: '22:00', status: 'expirada',
      })).toThrow(DomainError);
    });
  });

  describe('aprovar', () => {
    test('pendente vira aprovada', () => {
      const r = reservaPara(5);
      r.aprovar();
      expect(r.status).toBe(STATUS_RESERVA.APROVADA);
      expect(r.atualizadoEm).toBeInstanceOf(Date);
    });

    test('rejeita aprovar fora de pendente', () => {
      const r = reservaPara(5);
      r.aprovar();
      expect(() => r.aprovar()).toThrow(ConflitoEstadoError);

      const r2 = reservaPara(5, '19:00', '22:00', { status: STATUS_RESERVA.RECUSADA });
      expect(() => r2.aprovar()).toThrow(ConflitoEstadoError);
    });
  });

  describe('recusar', () => {
    test('pendente vira recusada', () => {
      const r = reservaPara(5);
      r.recusar();
      expect(r.status).toBe(STATUS_RESERVA.RECUSADA);
    });

    test('rejeita recusar fora de pendente', () => {
      const r = reservaPara(5);
      r.aprovar();
      expect(() => r.recusar()).toThrow(ConflitoEstadoError);
    });
  });

  describe('cancelarPeloCliente', () => {
    test('pendente >48h vira cancelada', () => {
      const r = reservaPara(5);
      r.cancelarPeloCliente();
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('aprovada >48h vira cancelada', () => {
      const r = reservaPara(5);
      r.aprovar();
      r.cancelarPeloCliente();
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('recusada não pode ser cancelada', () => {
      const r = reservaPara(5);
      r.recusar();
      expect(() => r.cancelarPeloCliente()).toThrow(ConflitoEstadoError);
    });

    test('já cancelada não pode ser cancelada de novo', () => {
      const r = reservaPara(5);
      r.cancelarPeloCliente();
      expect(() => r.cancelarPeloCliente()).toThrow(ConflitoEstadoError);
    });

    test('rejeita cancelamento dentro da janela de 48h', () => {
      const r = reservaPara(1);
      expect(() => r.cancelarPeloCliente()).toThrow(/48 horas/);
    });

    test('rejeita cancelamento de evento já passado', () => {
      const r = reservaPara(-3);
      expect(() => r.cancelarPeloCliente()).toThrow(/48 horas/);
    });

    test('exatamente 48h antes ainda permite', () => {
      const r = new Reserva({
        clienteId: 1, salaoId: 1,
        dataEvento: '2030-12-25', horaInicio: '20:00', horaFim: '23:00',
      });
      const agora = new Date(2030, 11, 23, 20, 0);
      expect(() => r.cancelarPeloCliente(agora)).not.toThrow();
    });
  });

  describe('cancelarPeloPrestador', () => {
    test('aprovada >48h vira cancelada', () => {
      const r = reservaPara(5);
      r.aprovar();
      r.cancelarPeloPrestador();
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('pendente >48h também vira cancelada', () => {
      const r = reservaPara(5);
      r.cancelarPeloPrestador();
      expect(r.status).toBe(STATUS_RESERVA.CANCELADA);
    });

    test('estado final (recusada) não pode ser cancelado', () => {
      const r = reservaPara(5);
      r.recusar();
      expect(() => r.cancelarPeloPrestador()).toThrow(ConflitoEstadoError);
    });

    test('rejeita cancelamento dentro de 48h', () => {
      const r = reservaPara(1);
      r.aprovar();
      expect(() => r.cancelarPeloPrestador()).toThrow(/48 horas/);
    });
  });

  describe('estaConcluida e podeSerAvaliada', () => {
    test('aprovada com data passada está concluída', () => {
      const r = reservaPara(-5);
      r.status = STATUS_RESERVA.APROVADA;
      expect(r.estaConcluida()).toBe(true);
      expect(r.podeSerAvaliada()).toBe(true);
    });

    test('aprovada com data futura não está concluída', () => {
      const r = reservaPara(5);
      r.aprovar();
      expect(r.estaConcluida()).toBe(false);
      expect(r.podeSerAvaliada()).toBe(false);
    });

    test('pendente nunca está concluída', () => {
      const r = reservaPara(-5);
      expect(r.estaConcluida()).toBe(false);
    });

    test('cancelada nunca está concluída', () => {
      const r = reservaPara(-5);
      r.aprovar();
      r.atualizadoEm = null;
      r.status = STATUS_RESERVA.CANCELADA;
      expect(r.estaConcluida()).toBe(false);
    });
  });

  describe('inicioDoEvento e cancelamentoPermitido', () => {
    test('inicioDoEvento retorna Date local', () => {
      const r = new Reserva({
        clienteId: 1, salaoId: 1,
        dataEvento: '2026-12-25', horaInicio: '19:00', horaFim: '23:00',
      });
      const inicio = r.inicioDoEvento();
      expect(inicio).toBeInstanceOf(Date);
      expect(inicio.getFullYear()).toBe(2026);
      expect(inicio.getHours()).toBe(19);
    });

    test('cancelamentoPermitido reflete a janela de 48h', () => {
      const r = reservaPara(5);
      expect(r.cancelamentoPermitido()).toBe(true);

      const r2 = reservaPara(1);
      expect(r2.cancelamentoPermitido()).toBe(false);

      const r3 = reservaPara(-3);
      expect(r3.cancelamentoPermitido()).toBe(false);
    });
  });
});
