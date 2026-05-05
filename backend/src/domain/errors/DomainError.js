class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}

class CredenciaisInvalidasError extends DomainError {
  constructor(message = 'credenciais inválidas') {
    super(message);
    this.name = 'CredenciaisInvalidasError';
  }
}

class AcessoNegadoError extends DomainError {
  constructor(message = 'acesso negado') {
    super(message);
    this.name = 'AcessoNegadoError';
  }
}

class ConflitoEstadoError extends DomainError {
  constructor(message) {
    super(message);
    this.name = 'ConflitoEstadoError';
  }
}

class RecursoNaoEncontradoError extends DomainError {
  constructor(message = 'recurso não encontrado') {
    super(message);
    this.name = 'RecursoNaoEncontradoError';
  }
}

module.exports = {
  DomainError,
  CredenciaisInvalidasError,
  AcessoNegadoError,
  ConflitoEstadoError,
  RecursoNaoEncontradoError,
};
