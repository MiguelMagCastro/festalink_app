const { Salao } = require('../../src/domain/entities/Salao');
const { DomainError } = require('../../src/domain/errors/DomainError');

const dadosBase = {
  prestadorId: 1,
  nome: 'Espaço Aurora',
  endereco: 'Rua das Palmeiras, 100',
  capacidadeMax: 100,
  valorDiaria: 1500,
};

describe('Salao', () => {
  describe('construção', () => {
    test('aceita dados mínimos válidos', () => {
      const s = new Salao(dadosBase);
      expect(s.nome).toBe('Espaço Aurora');
      expect(s.capacidadeMax).toBe(100);
    });

    test('booleanos default false', () => {
      const s = new Salao(dadosBase);
      expect(s.temEstacionamento).toBe(false);
      expect(s.aceitaPets).toBe(false);
    });

    test('força booleanos a partir de qualquer truthy', () => {
      const s = new Salao({ ...dadosBase, temCozinha: 1, aceitaPets: 'sim' });
      expect(s.temCozinha).toBe(true);
      expect(s.aceitaPets).toBe(true);
    });

    test('rejeita prestadorId ausente', () => {
      expect(() => new Salao({ ...dadosBase, prestadorId: null })).toThrow(DomainError);
    });

    test('rejeita capacidadeMax inválido', () => {
      expect(() => new Salao({ ...dadosBase, capacidadeMax: 0 })).toThrow(DomainError);
      expect(() => new Salao({ ...dadosBase, capacidadeMax: -5 })).toThrow(DomainError);
      expect(() => new Salao({ ...dadosBase, capacidadeMax: 1.5 })).toThrow(DomainError);
    });

    test('rejeita valorDiaria inválido', () => {
      expect(() => new Salao({ ...dadosBase, valorDiaria: -1 })).toThrow(DomainError);
      expect(() => new Salao({ ...dadosBase, valorDiaria: NaN })).toThrow(DomainError);
      expect(() => new Salao({ ...dadosBase, valorDiaria: 'caro' })).toThrow(DomainError);
    });

    test('aceita valorDiaria zero', () => {
      const s = new Salao({ ...dadosBase, valorDiaria: 0 });
      expect(s.valorDiaria).toBe(0);
    });

    test('rejeita areaM2 negativo', () => {
      expect(() => new Salao({ ...dadosBase, areaM2: -10 })).toThrow(DomainError);
    });

    test('aceita areaM2 null', () => {
      const s = new Salao({ ...dadosBase, areaM2: null });
      expect(s.areaM2).toBeNull();
    });
  });

  describe('pertenceA', () => {
    test('reconhece prestador dono', () => {
      const s = new Salao({ ...dadosBase, prestadorId: 7 });
      expect(s.pertenceA({ id: 7 })).toBe(true);
      expect(s.pertenceA({ id: 8 })).toBe(false);
    });
  });

  describe('arquivar', () => {
    test('marca deletadoEm', () => {
      const s = new Salao(dadosBase);
      expect(s.estaAtivo()).toBe(true);
      s.arquivar();
      expect(s.estaAtivo()).toBe(false);
    });

    test('arquivar duas vezes lança erro', () => {
      const s = new Salao(dadosBase);
      s.arquivar();
      expect(() => s.arquivar()).toThrow(DomainError);
    });
  });
});
