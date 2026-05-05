const jwt = require('jsonwebtoken');

class TokenService {
  constructor({ secret, expiresIn = '7d' }) {
    if (!secret) {
      throw new Error('TokenService: secret obrigatório');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  emitir(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verificar(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = { TokenService };
