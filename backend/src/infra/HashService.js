const bcrypt = require('bcryptjs');

class HashService {
  constructor(rounds = 10) {
    this.rounds = rounds;
  }

  async gerar(senhaPlana) {
    return bcrypt.hash(senhaPlana, this.rounds);
  }

  async comparar(senhaPlana, hash) {
    return bcrypt.compare(senhaPlana, hash);
  }
}

module.exports = { HashService };
