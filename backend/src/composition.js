const { getDatabase } = require('./db/init');

const { UsuarioRepository } = require('./repositories/UsuarioRepository');

const { HashService } = require('./infra/HashService');
const { TokenService } = require('./infra/TokenService');

const { RegistrarUsuario } = require('./services/auth/RegistrarUsuario');
const { Login } = require('./services/auth/Login');
const { ObterMeuPerfil } = require('./services/auth/ObterMeuPerfil');

const { AuthController } = require('./controllers/AuthController');
const { criarAutenticar, exigirPapel } = require('./middleware/authMiddleware');

function compor() {
  const db = getDatabase();

  const usuarioRepository = new UsuarioRepository(db);

  const hashService = new HashService();
  const tokenService = new TokenService({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const registrarUsuario = new RegistrarUsuario({ usuarioRepository, hashService });
  const login = new Login({ usuarioRepository, hashService, tokenService });
  const obterMeuPerfil = new ObterMeuPerfil({ usuarioRepository });

  const authController = new AuthController({ registrarUsuario, login, obterMeuPerfil });
  const autenticar = criarAutenticar({ tokenService });

  return {
    repositories: { usuarioRepository },
    services: { hashService, tokenService },
    useCases: { registrarUsuario, login, obterMeuPerfil },
    controllers: { authController },
    middlewares: { autenticar, exigirPapel },
  };
}

module.exports = { compor };
