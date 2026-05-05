function avaliacaoParaDTO(a) {
  return {
    id: a.id,
    reservaId: a.reservaId,
    nota: a.nota,
    comentario: a.comentario,
    postadaEm: a.postadaEm,
    respostaPrestador: a.respostaPrestador,
    respondidaEm: a.respondidaEm,
  };
}

class AvaliacaoController {
  constructor({
    postarAvaliacao,
    editarAvaliacao,
    excluirAvaliacao,
    listarAvaliacoesDoSalao,
    responderAvaliacao,
    editarResposta,
    excluirResposta,
  }) {
    this.postarAvaliacao = postarAvaliacao;
    this.editarAvaliacao = editarAvaliacao;
    this.excluirAvaliacao = excluirAvaliacao;
    this.listarAvaliacoesDoSalao = listarAvaliacoesDoSalao;
    this.responderAvaliacao = responderAvaliacao;
    this.editarResposta = editarResposta;
    this.excluirResposta = excluirResposta;
  }

  postar(req, res, next) {
    try {
      const reservaId = Number(req.params.id);
      const av = this.postarAvaliacao.executar({
        reservaId,
        clienteId: req.usuario.id,
        dados: req.body || {},
      });
      return res.status(201).json(avaliacaoParaDTO(av));
    } catch (err) { return next(err); }
  }

  editar(req, res, next) {
    try {
      const reservaId = Number(req.params.id);
      const av = this.editarAvaliacao.executar({
        reservaId,
        clienteId: req.usuario.id,
        dados: req.body || {},
      });
      return res.json(avaliacaoParaDTO(av));
    } catch (err) { return next(err); }
  }

  excluir(req, res, next) {
    try {
      const reservaId = Number(req.params.id);
      this.excluirAvaliacao.executar({
        reservaId,
        clienteId: req.usuario.id,
      });
      return res.status(204).send();
    } catch (err) { return next(err); }
  }

  listarDoSalao(req, res, next) {
    try {
      const salaoId = Number(req.params.id);
      const lista = this.listarAvaliacoesDoSalao.executar({ salaoId });
      return res.json(lista.map(avaliacaoParaDTO));
    } catch (err) { return next(err); }
  }

  responder(req, res, next) {
    try {
      const avaliacaoId = Number(req.params.id);
      const av = this.responderAvaliacao.executar({
        avaliacaoId,
        prestadorId: req.usuario.id,
        dados: req.body || {},
      });
      return res.status(201).json(avaliacaoParaDTO(av));
    } catch (err) { return next(err); }
  }

  atualizarResposta(req, res, next) {
    try {
      const avaliacaoId = Number(req.params.id);
      const av = this.editarResposta.executar({
        avaliacaoId,
        prestadorId: req.usuario.id,
        dados: req.body || {},
      });
      return res.json(avaliacaoParaDTO(av));
    } catch (err) { return next(err); }
  }

  removerResposta(req, res, next) {
    try {
      const avaliacaoId = Number(req.params.id);
      const av = this.excluirResposta.executar({
        avaliacaoId,
        prestadorId: req.usuario.id,
      });
      return res.json(avaliacaoParaDTO(av));
    } catch (err) { return next(err); }
  }
}

module.exports = { AvaliacaoController };
