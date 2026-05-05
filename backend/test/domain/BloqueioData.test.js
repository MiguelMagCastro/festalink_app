const { BloqueioData } = require('../../src/domain/entities/BloqueioData');
const { Periodo } = require('../../src/domain/valueObjects/Periodo');
const { DomainError } = require('../../src/domain/errors/DomainError');

const dadosBase = {
  salaoId: 1,
  data: '2026-12-25',
  horaInicio: '14:00',
  horaFim: '20:00',
};

describe('BloqueioData', () => {
  describe('construção', () => {
    test('aceita dados válidos', () => {
      const b = new BloqueioData({ ...dadosBase, motivo: 'Natal' });
      expect(b.motivo).toBe('Natal');
    });

    test('motivo é null por default', () => {
      const b = new BloqueioData(dadosBase);
      expect(b.motivo).toBeNull();
    });

    test('rejeita data fora do formato YYYY-MM-DD', () => {
      expect(() => new BloqueioData({ ...dadosBase, data: '25/12/2026' })).toThrow(DomainError);
      expect(() => new BloqueioData({ ...dadosBase, data: '2026-12-25T00:00' })).toThrow(DomainError);
      expect(() => new BloqueioData({ ...dadosBase, data: null })).toThrow(DomainError);
    });

    test('rejeita salaoId ausente', () => {
      expect(() => new BloqueioData({ ...dadosBase, salaoId: null })).toThrow(DomainError);
    });

    test('rejeita horaInicio depois de horaFim', () => {
      expect(() => new BloqueioData({ ...dadosBase, horaInicio: '20:00', horaFim: '14:00' })).toThrow(DomainError);
    });
  });

  describe('conflitaCom', () => {
    const b = new BloqueioData({ ...dadosBase, horaInicio: '14:00', horaFim: '20:00' });

    test('mesma data e horários sobrepostos retorna true', () => {
      expect(b.conflitaCom('2026-12-25', new Periodo('15:00', '18:00'))).toBe(true);
      expect(b.conflitaCom('2026-12-25', new Periodo('19:00', '22:00'))).toBe(true);
    });

    test('mesma data e horários disjuntos retorna false', () => {
      expect(b.conflitaCom('2026-12-25', new Periodo('08:00', '12:00'))).toBe(false);
      expect(b.conflitaCom('2026-12-25', new Periodo('21:00', '23:00'))).toBe(false);
    });

    test('horários apenas se tocando não conflitam', () => {
      expect(b.conflitaCom('2026-12-25', new Periodo('20:00', '23:00'))).toBe(false);
      expect(b.conflitaCom('2026-12-25', new Periodo('10:00', '14:00'))).toBe(false);
    });

    test('data diferente nunca conflita', () => {
      expect(b.conflitaCom('2026-12-26', new Periodo('15:00', '18:00'))).toBe(false);
    });
  });
});
