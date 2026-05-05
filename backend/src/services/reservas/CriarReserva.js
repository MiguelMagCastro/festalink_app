const { Reserva } = require('../../domain/entities/Reserva');
const { Periodo } = require('../../domain/valueObjects/Periodo');
const {
  DomainError,
  RecursoNaoEncontradoError,
  ConflitoEstadoError,
} = require('../../domain/errors/DomainError');

function diaDaSemanaUTC(dataIso) {
  const [y, m, d] = dataIso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

class CriarReserva {
  constructor({ salaoRepository, horarioRepository, bloqueioRepository, reservaRepository }) {
    this.salaoRepository = salaoRepository;
    this.horarioRepository = horarioRepository;
    this.bloqueioRepository = bloqueioRepository;
    this.reservaRepository = reservaRepository;
  }

  executar({ clienteId, dados }) {
    if (!dados.salaoId) {
      throw new DomainError('salaoId obrigatório');
    }

    const salao = this.salaoRepository.buscarPorId(dados.salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }

    const periodo = new Periodo(dados.horaInicio, dados.horaFim);
    const dia = diaDaSemanaUTC(dados.dataEvento);

    const horarios = this.horarioRepository.listarPorSalao(salao.id);
    const grade = horarios.find(h => h.diaSemana === dia);
    if (!grade) {
      throw new ConflitoEstadoError('o salão não funciona nesse dia da semana');
    }
    if (!grade.cobre(periodo)) {
      throw new ConflitoEstadoError('horário pedido está fora do horário de funcionamento do salão');
    }

    const bloqueios = this.bloqueioRepository.listarPorSalaoEData(salao.id, dados.dataEvento);
    for (const b of bloqueios) {
      if (b.conflitaCom(dados.dataEvento, periodo)) {
        throw new ConflitoEstadoError('a data e horário pedidos estão bloqueados pelo prestador');
      }
    }

    const ativas = this.reservaRepository.listarAtivasNaData(salao.id, dados.dataEvento);
    for (const r of ativas) {
      if (r.periodo().intersectaCom(periodo)) {
        throw new ConflitoEstadoError('já existe uma reserva ativa que conflita com esse horário');
      }
    }

    const reserva = new Reserva({
      clienteId,
      salaoId: salao.id,
      dataEvento: dados.dataEvento,
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
    });

    return this.reservaRepository.criar(reserva);
  }
}

module.exports = { CriarReserva };
