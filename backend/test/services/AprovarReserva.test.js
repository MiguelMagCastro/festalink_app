const { AprovarReserva } = require('../../src/services/reservas/AprovarReserva');
const { RecusarReserva } = require('../../src/services/reservas/RecusarReserva');
const { Reserva, STATUS_RESERVA } = require('../../src/domain/entities/Reserva');
const { Salao } = require('../../src/domain/entities/Salao');
const {
  AcessoNegadoError,
  RecursoNaoEncontradoError,
} = require('../../src/domain/errors/DomainError');

function reservaPendente() {
  return new Reserva({
    id: 1, clienteId: 2, salaoId: 5,
    dataEvento: '2030-01-01', horaInicio: '19:00', horaFim: '22:00',
    status: STATUS_RESERVA.PENDENTE,
  });
}

function salaoDoPrestador(prestadorId = 10) {
  return new Salao({
    id: 5, prestadorId, nome: 'A', endereco: 'x',
    capacidadeMax: 50, valorDiaria: 1000,
  });
}

describe('AprovarReserva publica evento', () => {
  test('publica ReservaAprovada quando aprova com sucesso', async () => {
    const publish = jest.fn().mockResolvedValue();
    const useCase = new AprovarReserva({
      reservaRepository: {
        buscarPorId: () => reservaPendente(),
        atualizar: r => r,
      },
      salaoRepository: { buscarPorId: () => salaoDoPrestador(10) },
      eventPublisher: { publicar: publish },
    });
    useCase.executar({ reservaId: 1, prestadorId: 10 });
    await new Promise(r => setImmediate(r));
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][0].type).toBe('ReservaAprovada');
    expect(publish.mock.calls[0][0].payload.reservaId).toBe(1);
  });

  test('não publica quando salão não pertence ao prestador', () => {
    const publish = jest.fn();
    const useCase = new AprovarReserva({
      reservaRepository: { buscarPorId: () => reservaPendente(), atualizar: r => r },
      salaoRepository: { buscarPorId: () => salaoDoPrestador(999) },
      eventPublisher: { publicar: publish },
    });
    expect(() => useCase.executar({ reservaId: 1, prestadorId: 10 }))
      .toThrow(AcessoNegadoError);
    expect(publish).not.toHaveBeenCalled();
  });

  test('não publica quando reserva não existe', () => {
    const publish = jest.fn();
    const useCase = new AprovarReserva({
      reservaRepository: { buscarPorId: () => null, atualizar: r => r },
      salaoRepository: { buscarPorId: () => salaoDoPrestador() },
      eventPublisher: { publicar: publish },
    });
    expect(() => useCase.executar({ reservaId: 99, prestadorId: 10 }))
      .toThrow(RecursoNaoEncontradoError);
    expect(publish).not.toHaveBeenCalled();
  });

  test('funciona sem publisher (eventos opcionais)', () => {
    const useCase = new AprovarReserva({
      reservaRepository: { buscarPorId: () => reservaPendente(), atualizar: r => r },
      salaoRepository: { buscarPorId: () => salaoDoPrestador(10) },
    });
    expect(() => useCase.executar({ reservaId: 1, prestadorId: 10 })).not.toThrow();
  });
});

describe('RecusarReserva publica evento', () => {
  test('publica ReservaRecusada quando recusa com sucesso', async () => {
    const publish = jest.fn().mockResolvedValue();
    const useCase = new RecusarReserva({
      reservaRepository: {
        buscarPorId: () => reservaPendente(),
        atualizar: r => r,
      },
      salaoRepository: { buscarPorId: () => salaoDoPrestador(10) },
      eventPublisher: { publicar: publish },
    });
    useCase.executar({ reservaId: 1, prestadorId: 10 });
    await new Promise(r => setImmediate(r));
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][0].type).toBe('ReservaRecusada');
  });
});
