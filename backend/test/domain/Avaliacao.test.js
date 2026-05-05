const { Avaliacao } = require('../../src/domain/entities/Avaliacao');
const { DomainError, ConflitoEstadoError } = require('../../src/domain/errors/DomainError');

function novaAvaliacao(overrides = {}) {
  return new Avaliacao({ reservaId: 1, nota: 5, comentario: 'top', ...overrides });
}

describe('Avaliacao', () => {
  describe('construção', () => {
    test('aceita dados válidos', () => {
      const a = novaAvaliacao();
      expect(a.nota).toBe(5);
      expect(a.foiRespondida()).toBe(false);
    });

    test('rejeita nota fora de 1..5', () => {
      expect(() => novaAvaliacao({ nota: 0 })).toThrow(DomainError);
      expect(() => novaAvaliacao({ nota: 6 })).toThrow(DomainError);
      expect(() => novaAvaliacao({ nota: 4.5 })).toThrow(DomainError);
    });

    test('rejeita reservaId ausente', () => {
      expect(() => new Avaliacao({ nota: 5 })).toThrow(DomainError);
    });

    test('comentario opcional', () => {
      const a = new Avaliacao({ reservaId: 1, nota: 5 });
      expect(a.comentario).toBeNull();
    });
  });

  describe('foiRespondida e clientePodeEditar', () => {
    test('avaliação sem resposta', () => {
      const a = novaAvaliacao();
      expect(a.foiRespondida()).toBe(false);
      expect(a.clientePodeEditar()).toBe(true);
    });

    test('avaliação respondida congela edição do cliente', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      expect(a.foiRespondida()).toBe(true);
      expect(a.clientePodeEditar()).toBe(false);
    });
  });

  describe('responder', () => {
    test('aceita resposta nova', () => {
      const a = novaAvaliacao();
      a.responder('obrigada pelo feedback');
      expect(a.respostaPrestador).toBe('obrigada pelo feedback');
      expect(a.respondidaEm).toBeInstanceOf(Date);
    });

    test('rejeita responder duas vezes', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      expect(() => a.responder('de novo')).toThrow(ConflitoEstadoError);
    });

    test('rejeita texto vazio', () => {
      const a = novaAvaliacao();
      expect(() => a.responder('')).toThrow(DomainError);
      expect(() => a.responder(null)).toThrow(DomainError);
    });
  });

  describe('editarPeloCliente', () => {
    test('atualiza nota e comentário', () => {
      const a = novaAvaliacao();
      a.editarPeloCliente(3, 'mudei de ideia');
      expect(a.nota).toBe(3);
      expect(a.comentario).toBe('mudei de ideia');
    });

    test('rejeita após resposta do prestador', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      expect(() => a.editarPeloCliente(2, 'pior')).toThrow(ConflitoEstadoError);
    });

    test('valida nota nova', () => {
      const a = novaAvaliacao();
      expect(() => a.editarPeloCliente(99, 'demais')).toThrow(DomainError);
    });
  });

  describe('prestadorPodeEditarResposta', () => {
    test('antes de responder retorna false', () => {
      const a = novaAvaliacao();
      expect(a.prestadorPodeEditarResposta()).toBe(false);
    });

    test('logo após responder retorna true', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      expect(a.prestadorPodeEditarResposta()).toBe(true);
    });

    test('25h depois retorna false', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      const futuro = new Date(Date.now() + 25 * 3600 * 1000);
      expect(a.prestadorPodeEditarResposta(futuro)).toBe(false);
    });

    test('exatamente 23h depois retorna true', () => {
      const a = novaAvaliacao();
      a.responder('obrigada');
      const futuro = new Date(Date.now() + 23 * 3600 * 1000);
      expect(a.prestadorPodeEditarResposta(futuro)).toBe(true);
    });
  });

  describe('editarResposta', () => {
    test('atualiza dentro da janela', () => {
      const a = novaAvaliacao();
      a.responder('primeira versão');
      a.editarResposta('versão revisada');
      expect(a.respostaPrestador).toBe('versão revisada');
    });

    test('rejeita fora da janela', () => {
      const a = novaAvaliacao();
      a.responder('texto');
      const futuro = new Date(Date.now() + 25 * 3600 * 1000);
      expect(() => a.editarResposta('depois', futuro)).toThrow(ConflitoEstadoError);
    });

    test('rejeita texto vazio', () => {
      const a = novaAvaliacao();
      a.responder('texto');
      expect(() => a.editarResposta('')).toThrow(DomainError);
    });
  });

  describe('excluirResposta', () => {
    test('limpa resposta dentro da janela', () => {
      const a = novaAvaliacao();
      a.responder('texto');
      a.excluirResposta();
      expect(a.respostaPrestador).toBeNull();
      expect(a.respondidaEm).toBeNull();
      expect(a.foiRespondida()).toBe(false);
    });

    test('libera de novo edição do cliente após excluir resposta', () => {
      const a = novaAvaliacao();
      a.responder('texto');
      expect(a.clientePodeEditar()).toBe(false);
      a.excluirResposta();
      expect(a.clientePodeEditar()).toBe(true);
    });

    test('rejeita fora da janela', () => {
      const a = novaAvaliacao();
      a.responder('texto');
      const futuro = new Date(Date.now() + 25 * 3600 * 1000);
      expect(() => a.excluirResposta(futuro)).toThrow(ConflitoEstadoError);
    });
  });
});
