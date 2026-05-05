const { Usuario } = require('../../domain/entities/Usuario');
const { DomainError, ConflitoEstadoError } = require('../../domain/errors/DomainError');

class RegistrarUsuario {
  constructor({ usuarioRepository, hashService }) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
  }

  async executar({ nome, email, senha, papel }) {
    if (typeof senha !== 'string' || senha.length < 6) {
      throw new DomainError('senha deve ter pelo menos 6 caracteres');
    }
    const existente = this.usuarioRepository.buscarPorEmail(email);
    if (existente) {
      throw new ConflitoEstadoError('email já cadastrado');
    }
    const senhaHash = await this.hashService.gerar(senha);
    const usuario = new Usuario({ nome, email, senhaHash, papel });
    return this.usuarioRepository.criar(usuario);
  }
}

module.exports = { RegistrarUsuario };
