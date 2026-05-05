const { Salao } = require('../../domain/entities/Salao');

class CriarSalao {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar({ prestadorId, dados }) {
    const salao = new Salao({
      prestadorId,
      nome: dados.nome,
      descricao: dados.descricao ?? null,
      endereco: dados.endereco,
      capacidadeMax: dados.capacidadeMax,
      valorDiaria: dados.valorDiaria,
      areaM2: dados.areaM2 ?? null,
      temEstacionamento: dados.temEstacionamento ?? false,
      temCozinha: dados.temCozinha ?? false,
      permiteMusicaAoVivo: dados.permiteMusicaAoVivo ?? false,
      aceitaPets: dados.aceitaPets ?? false,
      regrasAdicionais: dados.regrasAdicionais ?? null,
    });
    return this.salaoRepository.criar(salao);
  }
}

module.exports = { CriarSalao };
