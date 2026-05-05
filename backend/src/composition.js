const { getDatabase } = require('./db/init');

const { UsuarioRepository } = require('./repositories/UsuarioRepository');
const { SalaoRepository } = require('./repositories/SalaoRepository');
const { HorarioFuncionamentoRepository } = require('./repositories/HorarioFuncionamentoRepository');
const { BloqueioDataRepository } = require('./repositories/BloqueioDataRepository');

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

const { AuthController } = require('./controllers/AuthController');
const { SalaoController } = require('./controllers/SalaoController');
const { criarAutenticar, exigirPapel } = require('./middleware/authMiddleware');

function compor() {
  const db = getDatabase();

  const usuarioRepository = new UsuarioRepository(db);
  const salaoRepository = new SalaoRepository(db);
  const horarioRepository = new HorarioFuncionamentoRepository(db);
  const bloqueioRepository = new BloqueioDataRepository(db);

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

  const autenticar = criarAutenticar({ tokenService });

  return {
    repositories: { usuarioRepository, salaoRepository, horarioRepository, bloqueioRepository },
    services: { hashService, tokenService },
    useCases: {
      registrarUsuario, login, obterMeuPerfil,
      criarSalao, listarSaloes, listarMeusSaloes, obterSalao,
      atualizarSalao, excluirSalao, definirHorarios,
      criarBloqueio, listarBloqueios, removerBloqueio,
    },
    controllers: { authController, salaoController },
    middlewares: { autenticar, exigirPapel },
  };
}

module.exports = { compor };
