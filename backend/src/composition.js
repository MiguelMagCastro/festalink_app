const { getDatabase } = require('./db/init');

const { UsuarioRepository } = require('./repositories/UsuarioRepository');
const { SalaoRepository } = require('./repositories/SalaoRepository');
const { HorarioFuncionamentoRepository } = require('./repositories/HorarioFuncionamentoRepository');
const { BloqueioDataRepository } = require('./repositories/BloqueioDataRepository');
const { ReservaRepository } = require('./repositories/ReservaRepository');
const { AvaliacaoRepository } = require('./repositories/AvaliacaoRepository');

const { HashService } = require('./infra/HashService');
const { TokenService } = require('./infra/TokenService');
const { UnitOfWork } = require('./infra/UnitOfWork');
const { RabbitMQEventPublisher } = require('./infra/RabbitMQEventPublisher');
const { RabbitMQEventConsumer } = require('./infra/RabbitMQEventConsumer');
const { WebSocketNotifier } = require('./infra/WebSocketNotifier');

const { RegistrarUsuario } = require('./services/auth/RegistrarUsuario');
const { Login } = require('./services/auth/Login');
const { ObterMeuPerfil } = require('./services/auth/ObterMeuPerfil');

const { CriarSalao } = require('./services/saloes/CriarSalao');
const { ListarSaloes } = require('./services/saloes/ListarSaloes');
const { ListarMeusSaloes } = require('./services/saloes/ListarMeusSaloes');
const { ObterSalao } = require('./services/saloes/ObterSalao');
const { AtualizarSalao } = require('./services/saloes/AtualizarSalao');
const { ExcluirSalao } = require('./services/saloes/ExcluirSalao');
const { DefinirHorarios } = require('./services/saloes/DefinirHorarios');
const { ListarHorarios } = require('./services/saloes/ListarHorarios');
const { CriarBloqueio } = require('./services/saloes/CriarBloqueio');
const { ListarBloqueios } = require('./services/saloes/ListarBloqueios');
const { RemoverBloqueio } = require('./services/saloes/RemoverBloqueio');

const { CriarReserva } = require('./services/reservas/CriarReserva');
const { ListarMinhasReservas } = require('./services/reservas/ListarMinhasReservas');
const { ListarReservasRecebidas } = require('./services/reservas/ListarReservasRecebidas');
const { AprovarReserva } = require('./services/reservas/AprovarReserva');
const { RecusarReserva } = require('./services/reservas/RecusarReserva');
const { CancelarReserva } = require('./services/reservas/CancelarReserva');

const { PostarAvaliacao } = require('./services/avaliacoes/PostarAvaliacao');
const { EditarAvaliacao } = require('./services/avaliacoes/EditarAvaliacao');
const { ExcluirAvaliacao } = require('./services/avaliacoes/ExcluirAvaliacao');
const { ListarAvaliacoesDoSalao } = require('./services/avaliacoes/ListarAvaliacoesDoSalao');
const { ResponderAvaliacao } = require('./services/avaliacoes/ResponderAvaliacao');
const { EditarResposta } = require('./services/avaliacoes/EditarResposta');
const { ExcluirResposta } = require('./services/avaliacoes/ExcluirResposta');

const { AuthController } = require('./controllers/AuthController');
const { SalaoController } = require('./controllers/SalaoController');
const { ReservaController } = require('./controllers/ReservaController');
const { AvaliacaoController } = require('./controllers/AvaliacaoController');
const { criarAutenticar, exigirPapel } = require('./middleware/authMiddleware');

function comporBaseInfra() {
  const db = getDatabase();

  const usuarioRepository = new UsuarioRepository(db);
  const salaoRepository = new SalaoRepository(db);
  const horarioRepository = new HorarioFuncionamentoRepository(db);
  const bloqueioRepository = new BloqueioDataRepository(db);
  const reservaRepository = new ReservaRepository(db);
  const avaliacaoRepository = new AvaliacaoRepository(db);

  const tokenService = new TokenService({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return {
    db,
    repositories: {
      usuarioRepository, salaoRepository, horarioRepository,
      bloqueioRepository, reservaRepository, avaliacaoRepository,
    },
    tokenService,
  };
}

function comporApi() {
  const base = comporBaseInfra();
  const { repositories, tokenService } = base;
  const {
    usuarioRepository, salaoRepository, horarioRepository,
    bloqueioRepository, reservaRepository, avaliacaoRepository,
  } = repositories;

  const hashService = new HashService();
  const unitOfWork = new UnitOfWork(base.db);

  const rabbitUrl = process.env.RABBITMQ_URL;
  const exchange = process.env.EVENTOS_EXCHANGE || 'festalink.eventos';

  if (!rabbitUrl) {
    throw new Error('RABBITMQ_URL não definida: API precisa do broker pra publicar eventos');
  }

  const eventPublisher = new RabbitMQEventPublisher({ url: rabbitUrl, exchange });

  const registrarUsuario = new RegistrarUsuario({ usuarioRepository, hashService });
  const login = new Login({ usuarioRepository, hashService, tokenService });
  const obterMeuPerfil = new ObterMeuPerfil({ usuarioRepository });

  const criarSalao = new CriarSalao({ salaoRepository });
  const listarSaloes = new ListarSaloes({ salaoRepository });
  const listarMeusSaloes = new ListarMeusSaloes({ salaoRepository });
  const obterSalao = new ObterSalao({ salaoRepository });
  const atualizarSalao = new AtualizarSalao({ salaoRepository });
  const excluirSalao = new ExcluirSalao({ salaoRepository });
  const definirHorarios = new DefinirHorarios({ salaoRepository, horarioRepository });
  const listarHorarios = new ListarHorarios({ salaoRepository, horarioRepository });
  const criarBloqueio = new CriarBloqueio({ salaoRepository, bloqueioRepository });
  const listarBloqueios = new ListarBloqueios({ salaoRepository, bloqueioRepository });
  const removerBloqueio = new RemoverBloqueio({ salaoRepository, bloqueioRepository });

  const criarReserva = new CriarReserva({
    unitOfWork,
    salaoRepository,
    horarioRepository,
    bloqueioRepository,
    reservaRepository,
    eventPublisher,
  });
  const listarMinhasReservas = new ListarMinhasReservas({ reservaRepository });
  const listarReservasRecebidas = new ListarReservasRecebidas({ reservaRepository });
  const aprovarReserva = new AprovarReserva({ reservaRepository, salaoRepository, eventPublisher });
  const recusarReserva = new RecusarReserva({ reservaRepository, salaoRepository, eventPublisher });
  const cancelarReserva = new CancelarReserva({ reservaRepository, salaoRepository });

  const postarAvaliacao = new PostarAvaliacao({ reservaRepository, avaliacaoRepository, salaoRepository });
  const editarAvaliacao = new EditarAvaliacao({ reservaRepository, avaliacaoRepository, salaoRepository });
  const excluirAvaliacao = new ExcluirAvaliacao({ reservaRepository, avaliacaoRepository, salaoRepository });
  const listarAvaliacoesDoSalao = new ListarAvaliacoesDoSalao({ salaoRepository, avaliacaoRepository });
  const responderAvaliacao = new ResponderAvaliacao({ avaliacaoRepository, reservaRepository, salaoRepository });
  const editarResposta = new EditarResposta({ avaliacaoRepository, reservaRepository, salaoRepository });
  const excluirResposta = new ExcluirResposta({ avaliacaoRepository, reservaRepository, salaoRepository });

  const authController = new AuthController({ registrarUsuario, login, obterMeuPerfil });
  const salaoController = new SalaoController({
    criarSalao, listarSaloes, listarMeusSaloes, obterSalao,
    atualizarSalao, excluirSalao, definirHorarios, listarHorarios,
    criarBloqueio, listarBloqueios, removerBloqueio,
  });
  const reservaController = new ReservaController({
    criarReserva, listarMinhasReservas, listarReservasRecebidas,
    aprovarReserva, recusarReserva, cancelarReserva,
  });
  const avaliacaoController = new AvaliacaoController({
    postarAvaliacao, editarAvaliacao, excluirAvaliacao,
    listarAvaliacoesDoSalao, responderAvaliacao,
    editarResposta, excluirResposta,
  });

  const autenticar = criarAutenticar({ tokenService });

  return {
    repositories,
    services: { hashService, tokenService, unitOfWork },
    infra: { eventPublisher },
    controllers: { authController, salaoController, reservaController, avaliacaoController },
    middlewares: { autenticar, exigirPapel },
  };
}

function comporWorker() {
  const base = comporBaseInfra();
  const { repositories, tokenService } = base;
  const { salaoRepository } = repositories;

  const rabbitUrl = process.env.RABBITMQ_URL;
  const exchange = process.env.EVENTOS_EXCHANGE || 'festalink.eventos';
  const fila = process.env.EVENTOS_FILA_WORKER || 'festalink.worker';
  const routingKeys = (process.env.EVENTOS_ROUTING_KEYS || 'reserva.#')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const wsPort = Number(process.env.WS_PORT || 3001);

  if (!rabbitUrl) {
    throw new Error('RABBITMQ_URL não definida: worker precisa do broker pra consumir eventos');
  }

  const wsNotifier = new WebSocketNotifier({
    porta: wsPort,
    tokenService,
    salaoRepository,
  });

  const eventConsumer = new RabbitMQEventConsumer({
    url: rabbitUrl,
    exchange,
    fila,
    routingKeys,
    onEvento: async (evento) => {
      console.log(`[consumer] ${evento.type} salao=${evento.payload?.salaoId} reserva=${evento.payload?.reservaId}`);
      if (evento.payload?.salaoId) {
        wsNotifier.notificarPrestadorDoSalao(evento.payload.salaoId, evento);
      }
    },
  });

  return {
    repositories,
    services: { tokenService },
    infra: { eventConsumer, wsNotifier },
  };
}

module.exports = { comporApi, comporWorker };
