const { HorarioFuncionamento } = require('../../src/domain/entities/HorarioFuncionamento');
const { Periodo } = require('../../src/domain/valueObjects/Periodo');
const { DomainError } = require('../../src/domain/errors/DomainError');

describe('HorarioFuncionamento', () => {
  describe('construção', () => {
    test('aceita dados válidos', () => {
      const h = new HorarioFuncionamento({
        salaoId: 1, diaSemana: 5, abreEm: '18:00', fechaEm: '23:59',
      });
      expect(h.diaSemana).toBe(5);
    });

    test('rejeita diaSemana fora de 0..6', () => {
      const base = { salaoId: 1, abreEm: '09:00', fechaEm: '17:00' };
      expect(() => new HorarioFuncionamento({ ...base, diaSemana: -1 })).toThrow(DomainError);
      expect(() => new HorarioFuncionamento({ ...base, diaSemana: 7 })).toThrow(DomainError);
      expect(() => new HorarioFuncionamento({ ...base, diaSemana: 1.5 })).toThrow(DomainError);
    });

    test('aceita diaSemana 0 (domingo)', () => {
      const h = new HorarioFuncionamento({
        salaoId: 1, diaSemana: 0, abreEm: '12:00', fechaEm: '22:00',
      });
      expect(h.diaSemana).toBe(0);
    });

    test('rejeita salaoId ausente', () => {
      expect(() => new HorarioFuncionamento({
        diaSemana: 5, abreEm: '18:00', fechaEm: '23:00',
      })).toThrow(DomainError);
    });

    test('rejeita abreEm depois de fechaEm', () => {
      expect(() => new HorarioFuncionamento({
        salaoId: 1, diaSemana: 5, abreEm: '18:00', fechaEm: '17:00',
      })).toThrow(DomainError);
    });
  });

  describe('cobre', () => {
    const h = new HorarioFuncionamento({
      salaoId: 1, diaSemana: 5, abreEm: '18:00', fechaEm: '23:59',
    });

    test('período dentro da janela é coberto', () => {
      expect(h.cobre(new Periodo('19:00', '22:00'))).toBe(true);
    });

    test('período idêntico à janela é coberto', () => {
      expect(h.cobre(new Periodo('18:00', '23:59'))).toBe(true);
    });

    test('período começando antes não é coberto', () => {
      expect(h.cobre(new Periodo('17:00', '20:00'))).toBe(false);
    });

    test('período terminando depois não é coberto', () => {
      expect(h.cobre(new Periodo('22:00', '23:59'))).toBe(true);
      expect(h.cobre(new Periodo('22:00', '23:59'))).toBe(true);
    });
  });
});
