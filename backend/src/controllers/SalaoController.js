function salaoParaDTO(salao) {
  return {
    id: salao.id,
    prestadorId: salao.prestadorId,
    nome: salao.nome,
    descricao: salao.descricao,
    endereco: salao.endereco,
    capacidadeMax: salao.capacidadeMax,
    valorDiaria: salao.valorDiaria,
    areaM2: salao.areaM2,
    temEstacionamento: salao.temEstacionamento,
    temCozinha: salao.temCozinha,
    permiteMusicaAoVivo: salao.permiteMusicaAoVivo,
    aceitaPets: salao.aceitaPets,
    regrasAdicionais: salao.regrasAdicionais,
    criadoEm: salao.criadoEm,
  };
}

function horarioParaDTO(h) {
  return {
    id: h.id,
    salaoId: h.salaoId,
    diaSemana: h.diaSemana,
    abreEm: h.abreEm,
    fechaEm: h.fechaEm,
  };
}

function bloqueioParaDTO(b) {
  return {
    id: b.id,
    salaoId: b.salaoId,
    data: b.data,
    horaInicio: b.horaInicio,
    horaFim: b.horaFim,
    motivo: b.motivo,
  };
}

class SalaoController {
  constructor({
    criarSalao,
    listarSaloes,
    listarMeusSaloes,
    obterSalao,
    atualizarSalao,
    excluirSalao,
    definirHorarios,
    criarBloqueio,
    listarBloqueios,
    removerBloqueio,
  }) {
    this.criarSalao = criarSalao;
    this.listarSaloes = listarSaloes;
    this.listarMeusSaloes = listarMeusSaloes;
    this.obterSalao = obterSalao;
    this.atualizarSalao = atualizarSalao;
    this.excluirSalao = excluirSalao;
    this.definirHorarios = definirHorarios;
    this.criarBloqueio = criarBloqueio;
    this.listarBloqueios = listarBloqueios;
    this.removerBloqueio = removerBloqueio;
  }

  listar(req, res, next) {
    try {
      const saloes = this.listarSaloes.executar();
      return res.json(saloes.map(salaoParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  meus(req, res, next) {
    try {
      const saloes = this.listarMeusSaloes.executar({ prestadorId: req.usuario.id });
      return res.json(saloes.map(salaoParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  obter(req, res, next) {
    try {
      const id = Number(req.params.id);
      const salao = this.obterSalao.executar({ id });
      return res.json(salaoParaDTO(salao));
    } catch (err) {
      return next(err);
    }
  }

  criar(req, res, next) {
    try {
      const salao = this.criarSalao.executar({
        prestadorId: req.usuario.id,
        dados: req.body || {},
      });
      return res.status(201).json(salaoParaDTO(salao));
    } catch (err) {
      return next(err);
    }
  }

  atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const salao = this.atualizarSalao.executar({
        id,
        prestadorId: req.usuario.id,
        dados: req.body || {},
      });
      return res.json(salaoParaDTO(salao));
    } catch (err) {
      return next(err);
    }
  }

  excluir(req, res, next) {
    try {
      const id = Number(req.params.id);
      this.excluirSalao.executar({ id, prestadorId: req.usuario.id });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  putHorarios(req, res, next) {
    try {
      const salaoId = Number(req.params.id);
      const horarios = (req.body && req.body.horarios) || [];
      const result = this.definirHorarios.executar({
        salaoId,
        prestadorId: req.usuario.id,
        horarios,
      });
      return res.json(result.map(horarioParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  adicionarBloqueio(req, res, next) {
    try {
      const salaoId = Number(req.params.id);
      const bloqueio = this.criarBloqueio.executar({
        salaoId,
        prestadorId: req.usuario.id,
        dados: req.body || {},
      });
      return res.status(201).json(bloqueioParaDTO(bloqueio));
    } catch (err) {
      return next(err);
    }
  }

  listarBloqueiosDoSalao(req, res, next) {
    try {
      const salaoId = Number(req.params.id);
      const lista = this.listarBloqueios.executar({
        salaoId,
        prestadorId: req.usuario.id,
      });
      return res.json(lista.map(bloqueioParaDTO));
    } catch (err) {
      return next(err);
    }
  }

  removerBloqueioDoSalao(req, res, next) {
    try {
      const salaoId = Number(req.params.id);
      const bloqueioId = Number(req.params.bloqId);
      this.removerBloqueio.executar({
        salaoId,
        bloqueioId,
        prestadorId: req.usuario.id,
      });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = { SalaoController };
