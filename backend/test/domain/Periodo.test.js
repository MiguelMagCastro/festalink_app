const { Periodo } = require('../../src/domain/valueObjects/Periodo');
const { DomainError } = require('../../src/domain/errors/DomainError');

describe('Periodo', () => {
  describe('construção', () => {
    test('aceita HH:MM válido', () => {
      const p = new Periodo('09:00', '17:30');
      expect(p.inicio).toBe('09:00');
      expect(p.fim).toBe('17:30');
    });

    test('rejeita hora fora do formato', () => {
      expect(() => new Periodo('9:00', '17:00')).toThrow(DomainError);
      expect(() => new Periodo('25:00', '26:00')).toThrow(DomainError);
      expect(() => new Periodo('abc', 'def')).toThrow(DomainError);
    });

    test('rejeita inicio igual ou maior que fim', () => {
      expect(() => new Periodo('17:00', '17:00')).toThrow(DomainError);
      expect(() => new Periodo('18:00', '17:00')).toThrow(DomainError);
    });

    test('é congelado', () => {
      const p = new Periodo('09:00', '17:00');
      expect(Object.isFrozen(p)).toBe(true);
    });
  });

  describe('intersectaCom', () => {
    test('períodos sobrepostos retornam true', () => {
      const a = new Periodo('14:00', '18:00');
      const b = new Periodo('16:00', '20:00');
      expect(a.intersectaCom(b)).toBe(true);
      expect(b.intersectaCom(a)).toBe(true);
    });

    test('períodos disjuntos retornam false', () => {
      const a = new Periodo('09:00', '12:00');
      const b = new Periodo('14:00', '18:00');
      expect(a.intersectaCom(b)).toBe(false);
    });

    test('períodos que apenas se tocam não conflitam', () => {
      const a = new Periodo('09:00', '12:00');
      const b = new Periodo('12:00', '15:00');
      expect(a.intersectaCom(b)).toBe(false);
    });

    test('um contendo o outro retorna true', () => {
      const a = new Periodo('09:00', '18:00');
      const b = new Periodo('12:00', '14:00');
      expect(a.intersectaCom(b)).toBe(true);
    });
  });

  describe('contem', () => {
    test('janela maior contém menor', () => {
      const a = new Periodo('09:00', '23:00');
      const b = new Periodo('19:00', '22:00');
      expect(a.contem(b)).toBe(true);
    });

    test('janela exatamente igual ainda contém', () => {
      const a = new Periodo('09:00', '17:00');
      const b = new Periodo('09:00', '17:00');
      expect(a.contem(b)).toBe(true);
    });

    test('janela menor não contém maior', () => {
      const a = new Periodo('09:00', '17:00');
      const b = new Periodo('08:00', '18:00');
      expect(a.contem(b)).toBe(false);
    });

    test('janela com início ou fim fora da outra não contém', () => {
      const a = new Periodo('09:00', '17:00');
      const b = new Periodo('08:00', '12:00');
      expect(a.contem(b)).toBe(false);
    });
  });

  describe('duracaoMinutos', () => {
    test('calcula corretamente', () => {
      expect(new Periodo('09:00', '10:30').duracaoMinutos()).toBe(90);
      expect(new Periodo('00:00', '23:59').duracaoMinutos()).toBe(23 * 60 + 59);
    });
  });

  describe('helpers estáticos', () => {
    test('paraMinutos converte HH:MM em total de minutos', () => {
      expect(Periodo.paraMinutos('00:00')).toBe(0);
      expect(Periodo.paraMinutos('01:30')).toBe(90);
      expect(Periodo.paraMinutos('23:59')).toBe(23 * 60 + 59);
    });

    test('validarHora não lança para hora válida', () => {
      expect(() => Periodo.validarHora('00:00')).not.toThrow();
      expect(() => Periodo.validarHora('23:59')).not.toThrow();
    });
  });
});
