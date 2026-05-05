const { RecursoNaoEncontradoError } = require('../../domain/errors/DomainError');

class ObterMeuPerfil {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  executar({ usuarioId }) {
    const usuario = this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new RecursoNaoEncontradoError('usuário não encontrado');
    }
    return usuario;
  }
}

module.exports = { ObterMeuPerfil };
