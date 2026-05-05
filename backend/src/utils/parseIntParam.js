const { DomainError } = require('../domain/errors/DomainError');

function parseIntParam(value, nome = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new DomainError(`${nome} inválido`);
  }
  return n;
}

module.exports = { parseIntParam };
