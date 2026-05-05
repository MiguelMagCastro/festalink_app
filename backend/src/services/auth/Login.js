const { CredenciaisInvalidasError } = require('../../domain/errors/DomainError');

class Login {
  constructor({ usuarioRepository, hashService, tokenService }) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async executar({ email, senha }) {
    if (typeof email !== 'string' || typeof senha !== 'string') {
      throw new CredenciaisInvalidasError();
    }
    const usuario = this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new CredenciaisInvalidasError();
    }
    const ok = await this.hashService.comparar(senha, usuario.senhaHash);
    if (!ok) {
      throw new CredenciaisInvalidasError();
    }
    const token = this.tokenService.emitir({
      sub: usuario.id,
      papel: usuario.papel,
    });
    return { token, usuario };
  }
}

module.exports = { Login };
