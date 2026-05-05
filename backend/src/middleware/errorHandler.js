const {
  DomainError,
  CredenciaisInvalidasError,
  AcessoNegadoError,
  ConflitoEstadoError,
  RecursoNaoEncontradoError,
} = require('../domain/errors/DomainError');

function errorHandler(err, _req, res, _next) {
  if (err instanceof CredenciaisInvalidasError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof AcessoNegadoError) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof RecursoNaoEncontradoError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ConflitoEstadoError) {
    return res.status(409).json({ error: err.message });
  }
  if (err instanceof DomainError) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'erro interno' });
}

module.exports = { errorHandler };
