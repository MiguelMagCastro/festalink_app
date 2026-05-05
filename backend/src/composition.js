const { getDatabase } = require('./db/init');

const { UsuarioRepository } = require('./repositories/UsuarioRepository');
const { SalaoRepository } = require('./repositories/SalaoRepository');
const { HorarioFuncionamentoRepository } = require('./repositories/HorarioFuncionamentoRepository');
const { BloqueioDataRepository } = require('./repositories/BloqueioDataRepository');
const { ReservaRepository } = require('./repositories/ReservaRepository');

const { HashService } = require('./infra/HashService');
const { TokenService } = require('./infra/TokenService');

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
const { CriarBloqueio } = require('./services/saloes/CriarBloqueio');
const { ListarBloqueios } = require('./services/saloes/ListarBloqueios');
const { RemoverBloqueio } = require('./services/saloes/RemoverBloqueio');

const { CriarReserva } = require('./services/reservas/CriarReserva');
const { ListarMinhasReservas } = require('./services/reservas/ListarMinhasReservas');
const { ListarReservasRecebidas } = require('./services/reservas/ListarReservasRecebidas');
const { AprovarReserva } = require('./services/reservas/AprovarReserva');
const { RecusarReserva } = require('./services/reservas/RecusarReserva');
const { CancelarReserva } = require('./services/reservas/CancelarReserva');

const { AuthController } = require('./controllers/AuthController');
const { SalaoController } = require('./controllers/SalaoController');
const { ReservaController } = require('./controllers/ReservaController');
const { criarAutenticar, exigirPapel } = require('./middleware/authMiddleware');

function compor() {
  const db = getDatabase();

  const usuarioRepository = new UsuarioRepository(db);
  const salaoRepository = new SalaoRepository(db);
  const horarioRepository = new HorarioFuncionamentoRepository(db);
  const bloqueioRepository = new BloqueioDataRepository(db);
  const reservaRepository = new ReservaRepository(db);

  const hashService = new HashService();
  const tokenService = new TokenService({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
  const criarBloqueio = new CriarBloqueio({ salaoRepository, bloqueioRepository });
  const listarBloqueios = new ListarBloqueios({ salaoRepository, bloqueioRepository });
  const removerBloqueio = new RemoverBloqueio({ salaoRepository, bloqueioRepository });

  const criarReserva = new CriarReserva({
    salaoRepository,
    horarioRepository,
    bloqueioRepository,
    reservaRepository,
  });
  const listarMinhasReservas = new ListarMinhasReservas({ reservaRepository });
  const listarReservasRecebidas = new ListarReservasRecebidas({ reservaRepository });
  const aprovarReserva = new AprovarReserva({ reservaRepository, salaoRepository });
  const recusarReserva = new RecusarReserva({ reservaRepository, salaoRepository });
  const cancelarReserva = new CancelarReserva({ reservaRepository, salaoRepository });

  const authController = new AuthController({ registrarUsuario, login, obterMeuPerfil });
  const salaoController = new SalaoController({
    criarSalao,
    listarSaloes,
    listarMeusSaloes,
    obterSalao,
    atualizarSalao,
    excluirSalao,
    definirHorarios,
    criarBloqueio,
    listarBloqueios,
    removerBloqueio,
  });
  const reservaController = new ReservaController({
    criarReserva,
    listarMinhasReservas,
    listarReservasRecebidas,
    aprovarReserva,
    recusarReserva,
    cancelarReserva,
  });

  const autenticar = criarAutenticar({ tokenService });

  return {
    repositories: {
      usuarioRepository, salaoRepository, horarioRepository,
      bloqueioRepository, reservaRepository,
    },
    services: { hashService, tokenService },
    useCases: {
      registrarUsuario, login, obterMeuPerfil,
      criarSalao, listarSaloes, listarMeusSaloes, obterSalao,
      atualizarSalao, excluirSalao, definirHorarios,
      criarBloqueio, listarBloqueios, removerBloqueio,
      criarReserva, listarMinhasReservas, listarReservasRecebidas,
      aprovarReserva, recusarReserva, cancelarReserva,
    },
    controllers: { authController, salaoController, reservaController },
    middlewares: { autenticar, exigirPapel },
  };
}

module.exports = { compor };
