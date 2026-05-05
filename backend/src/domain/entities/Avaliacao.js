const { DomainError, ConflitoEstadoError } = require('../errors/DomainError');

const JANELA_EDICAO_RESPOSTA_MS = 24 * 60 * 60 * 1000;

class Avaliacao {
  constructor({
    id = null,
    reservaId,
    nota,
    comentario = null,
    postadaEm = null,
    respostaPrestador = null,
    respondidaEm = null,
  }) {
    if (!reservaId) throw new DomainError('reservaId obrigatório');
    Avaliacao.validarNota(nota);

    this.id = id;
    this.reservaId = reservaId;
    this.nota = nota;
    this.comentario = comentario;
    this.postadaEm = postadaEm;
    this.respostaPrestador = respostaPrestador;
    this.respondidaEm = respondidaEm;
  }

  static validarNota(nota) {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new DomainError('nota deve ser inteiro entre 1 e 5');
    }
  }

  foiRespondida() {
    return this.respostaPrestador !== null && this.respondidaEm !== null;
  }

  clientePodeEditar() {
    return !this.foiRespondida();
  }

  prestadorPodeEditarResposta(agora = new Date()) {
    if (!this.foiRespondida()) return false;
    const respondidaEm = typeof this.respondidaEm === 'string'
      ? new Date(this.respondidaEm)
      : this.respondidaEm;
    const limite = new Date(respondidaEm.getTime() + JANELA_EDICAO_RESPOSTA_MS);
    return agora < limite;
  }

  responder(texto, agora = new Date()) {
    if (this.foiRespondida()) {
      throw new ConflitoEstadoError('esta avaliação já foi respondida');
    }
    if (!texto || typeof texto !== 'string') {
      throw new DomainError('texto da resposta obrigatório');
    }
    this.respostaPrestador = texto;
    this.respondidaEm = agora;
  }

  editarPeloCliente(novaNota, novoComentario) {
    if (!this.clientePodeEditar()) {
      throw new ConflitoEstadoError('avaliação não pode mais ser editada (prestador já respondeu)');
    }
    Avaliacao.validarNota(novaNota);
    this.nota = novaNota;
    this.comentario = novoComentario;
  }

  editarResposta(novoTexto, agora = new Date()) {
    if (!this.prestadorPodeEditarResposta(agora)) {
      throw new ConflitoEstadoError('resposta fora da janela de 24h ou ainda não postada');
    }
    if (!novoTexto || typeof novoTexto !== 'string') {
      throw new DomainError('novo texto da resposta obrigatório');
    }
    this.respostaPrestador = novoTexto;
  }

  excluirResposta(agora = new Date()) {
    if (!this.prestadorPodeEditarResposta(agora)) {
      throw new ConflitoEstadoError('resposta fora da janela de 24h ou ainda não postada');
    }
    this.respostaPrestador = null;
    this.respondidaEm = null;
  }
}

module.exports = { Avaliacao };
