const { Reserva } = require('../../domain/entities/Reserva');
const { Periodo } = require('../../domain/valueObjects/Periodo');
const {
  DomainError,
  RecursoNaoEncontradoError,
  ConflitoEstadoError,
} = require('../../domain/errors/DomainError');
const { reservaSolicitada } = require('../../domain/events');

function diaDaSemanaUTC(dataIso) {
  const [y, m, d] = dataIso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

class CriarReserva {
  constructor({ unitOfWork, salaoRepository, horarioRepository, bloqueioRepository, reservaRepository, eventPublisher }) {
    this.unitOfWork = unitOfWork;
    this.salaoRepository = salaoRepository;
    this.horarioRepository = horarioRepository;
    this.bloqueioRepository = bloqueioRepository;
    this.reservaRepository = reservaRepository;
    this.eventPublisher = eventPublisher;
  }

  executar({ clienteId, dados }) {
    if (!dados.salaoId || !Number.isInteger(Number(dados.salaoId))) {
      throw new DomainError('salaoId obrigatório');
    }
    if (!dados.dataEvento || typeof dados.dataEvento !== 'string'
        || !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataEvento)) {
      throw new DomainError('dataEvento deve estar no formato YYYY-MM-DD');
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

    const reservaPersistida = this.unitOfWork.run(() => {
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
    });

    if (this.eventPublisher) {
      Promise.resolve()
        .then(() => this.eventPublisher.publicar(reservaSolicitada(reservaPersistida)))
        .catch(err => console.error('[eventos] falha ao publicar ReservaSolicitada:', err.message));
    }

    return reservaPersistida;
  }
}

module.exports = { CriarReserva };
