const { Usuario, PAPEIS } = require('../../src/domain/entities/Usuario');
const { DomainError } = require('../../src/domain/errors/DomainError');

const dadosBase = {
  nome: 'Maria',
  email: 'maria@x.com',
  senhaHash: 'hash123',
  papel: 'cliente',
};

describe('Usuario', () => {
  describe('construção', () => {
    test('aceita papel cliente', () => {
      const u = new Usuario({ ...dadosBase, papel: 'cliente' });
      expect(u.ehCliente()).toBe(true);
      expect(u.ehPrestador()).toBe(false);
    });

    test('aceita papel prestador', () => {
      const u = new Usuario({ ...dadosBase, papel: 'prestador' });
      expect(u.ehPrestador()).toBe(true);
      expect(u.ehCliente()).toBe(false);
    });

    test('rejeita papel inválido', () => {
      expect(() => new Usuario({ ...dadosBase, papel: 'admin' })).toThrow(DomainError);
      expect(() => new Usuario({ ...dadosBase, papel: '' })).toThrow(DomainError);
      expect(() => new Usuario({ ...dadosBase, papel: null })).toThrow(DomainError);
    });

    test('rejeita nome vazio', () => {
      expect(() => new Usuario({ ...dadosBase, nome: '' })).toThrow(DomainError);
      expect(() => new Usuario({ ...dadosBase, nome: null })).toThrow(DomainError);
    });

    test('rejeita email vazio', () => {
      expect(() => new Usuario({ ...dadosBase, email: '' })).toThrow(DomainError);
    });

    test('rejeita senhaHash vazio', () => {
      expect(() => new Usuario({ ...dadosBase, senhaHash: '' })).toThrow(DomainError);
    });
  });

  describe('estado', () => {
    test('estaAtivo retorna true quando deletadoEm é null', () => {
      const u = new Usuario(dadosBase);
      expect(u.estaAtivo()).toBe(true);
    });

    test('estaAtivo retorna false quando deletadoEm está preenchido', () => {
      const u = new Usuario({ ...dadosBase, deletadoEm: new Date() });
      expect(u.estaAtivo()).toBe(false);
    });

    test('arquivar marca deletadoEm', () => {
      const u = new Usuario(dadosBase);
      const agora = new Date();
      u.arquivar(agora);
      expect(u.deletadoEm).toBe(agora);
      expect(u.estaAtivo()).toBe(false);
    });

    test('arquivar duas vezes lança erro', () => {
      const u = new Usuario(dadosBase);
      u.arquivar();
      expect(() => u.arquivar()).toThrow(DomainError);
    });
  });

  describe('PAPEIS', () => {
    test('exporta as constantes corretas', () => {
      expect(PAPEIS.CLIENTE).toBe('cliente');
      expect(PAPEIS.PRESTADOR).toBe('prestador');
    });
  });
});
