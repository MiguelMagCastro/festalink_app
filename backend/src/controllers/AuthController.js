function paraDTO(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    criadoEm: usuario.criadoEm,
  };
}

class AuthController {
  constructor({ registrarUsuario, login, obterMeuPerfil }) {
    this.registrarUsuario = registrarUsuario;
    this.login = login;
    this.obterMeuPerfil = obterMeuPerfil;
  }

  async registrar(req, res, next) {
    try {
      const { nome, email, senha, papel } = req.body || {};
      if (!nome || !email || !senha || !papel) {
        return res.status(400).json({ error: 'nome, email, senha e papel são obrigatórios' });
      }
      const usuario = await this.registrarUsuario.executar({ nome, email, senha, papel });
      return res.status(201).json(paraDTO(usuario));
    } catch (err) {
      return next(err);
    }
  }

  async fazerLogin(req, res, next) {
    try {
      const { email, senha } = req.body || {};
      if (!email || !senha) {
        return res.status(400).json({ error: 'email e senha são obrigatórios' });
      }
      const { token, usuario } = await this.login.executar({ email, senha });
      return res.json({ token, usuario: paraDTO(usuario) });
    } catch (err) {
      return next(err);
    }
  }

  eu(req, res, next) {
    try {
      const usuario = this.obterMeuPerfil.executar({ usuarioId: req.usuario.id });
      return res.json(paraDTO(usuario));
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = { AuthController };
