const { CriarReserva } = require('../../src/services/reservas/CriarReserva');
const { Salao } = require('../../src/domain/entities/Salao');
const { HorarioFuncionamento } = require('../../src/domain/entities/HorarioFuncionamento');
const { BloqueioData } = require('../../src/domain/entities/BloqueioData');
const { Reserva } = require('../../src/domain/entities/Reserva');
const { DomainError, ConflitoEstadoError, RecursoNaoEncontradoError } = require('../../src/domain/errors/DomainError');

function dataFutura(diasNoFuturo, diaSemanaAlvo) {
  let d = new Date(Date.now() + diasNoFuturo * 86400000);
  if (diaSemanaAlvo !== undefined) {
    while (d.getUTCDay() !== diaSemanaAlvo) {
      d = new Date(d.getTime() + 86400000);
    }
  }
  return d.toISOString().slice(0, 10);
}

function fakeSalao() {
  return new Salao({
    id: 1, prestadorId: 10, nome: 'Aurora', endereco: 'rua x',
    capacidadeMax: 100, valorDiaria: 1500,
  });
}

function montar({
  salao = fakeSalao(),
  horarios = [new HorarioFuncionamento({ salaoId: 1, diaSemana: 5, abreEm: '18:00', fechaEm: '23:59' })],
  bloqueios = [],
  reservasAtivas = [],
} = {}) {
  const reservaCriada = jest.fn(r => Object.assign({}, r, { id: 99 }));
  const useCase = new CriarReserva({
    unitOfWork: { run: fn => fn() },
    salaoRepository: { buscarPorId: jest.fn().mockReturnValue(salao) },
    horarioRepository: { listarPorSalao: jest.fn().mockReturnValue(horarios) },
    bloqueioRepository: { listarPorSalaoEData: jest.fn().mockReturnValue(bloqueios) },
    reservaRepository: {
      listarAtivasNaData: jest.fn().mockReturnValue(reservasAtivas),
      criar: reservaCriada,
    },
  });
  return { useCase, reservaCriada };
}

describe('CriarReserva (use case)', () => {
  test('cria reserva quando tudo está OK', () => {
    const { useCase, reservaCriada } = montar();
    const reserva = useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataFutura(7, 5),
        horaInicio: '19:00',
        horaFim: '22:00',
      },
    });
    expect(reservaCriada).toHaveBeenCalledTimes(1);
    expect(reserva.status).toBe('pendente');
  });

  test('rejeita quando dataEvento está ausente', () => {
    const { useCase } = montar();
    expect(() => useCase.executar({
      clienteId: 2,
      dados: { salaoId: 1, horaInicio: '19:00', horaFim: '22:00' },
    })).toThrow(DomainError);
  });

  test('rejeita quando salão não existe (404)', () => {
    const useCase = new CriarReserva({
      unitOfWork: { run: fn => fn() },
      salaoRepository: { buscarPorId: () => null },
      horarioRepository: { listarPorSalao: () => [] },
      bloqueioRepository: { listarPorSalaoEData: () => [] },
      reservaRepository: { listarAtivasNaData: () => [], criar: () => {} },
    });
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 99,
        dataEvento: dataFutura(7, 5),
        horaInicio: '19:00',
        horaFim: '22:00',
      },
    })).toThrow(RecursoNaoEncontradoError);
  });

  test('rejeita quando salão não funciona no dia da semana', () => {
    const { useCase } = montar({ horarios: [] });
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataFutura(7, 5),
        horaInicio: '19:00',
        horaFim: '22:00',
      },
    })).toThrow(/não funciona nesse dia/);
  });

  test('rejeita quando horário pedido excede a janela do salão', () => {
    const { useCase } = montar();
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataFutura(7, 5),
        horaInicio: '14:00',
        horaFim: '17:00',
      },
    })).toThrow(/fora do horário de funcionamento/);
  });

  test('rejeita quando há bloqueio na data conflitante', () => {
    const dataAlvo = dataFutura(7, 5);
    const bloqueio = new BloqueioData({
      salaoId: 1, data: dataAlvo,
      horaInicio: '18:00', horaFim: '23:00',
    });
    const { useCase } = montar({ bloqueios: [bloqueio] });
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataAlvo,
        horaInicio: '20:00',
        horaFim: '22:00',
      },
    })).toThrow(/bloqueados/);
  });

  test('rejeita quando outra reserva ativa conflita', () => {
    const dataAlvo = dataFutura(7, 5);
    const conflito = new Reserva({
      id: 5, clienteId: 9, salaoId: 1,
      dataEvento: dataAlvo, horaInicio: '20:00', horaFim: '22:00',
      status: 'aprovada',
    });
    const { useCase } = montar({ reservasAtivas: [conflito] });
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataAlvo,
        horaInicio: '21:00',
        horaFim: '22:30',
      },
    })).toThrow(ConflitoEstadoError);
  });

  test('períodos apenas se tocando NÃO conflitam', () => {
    const dataAlvo = dataFutura(7, 5);
    const conflito = new Reserva({
      id: 5, clienteId: 9, salaoId: 1,
      dataEvento: dataAlvo, horaInicio: '18:00', horaFim: '20:00',
      status: 'aprovada',
    });
    const { useCase } = montar({ reservasAtivas: [conflito] });
    expect(() => useCase.executar({
      clienteId: 2,
      dados: {
        salaoId: 1,
        dataEvento: dataAlvo,
        horaInicio: '20:00',
        horaFim: '22:00',
      },
    })).not.toThrow();
  });
});
