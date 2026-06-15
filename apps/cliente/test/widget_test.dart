import 'package:flutter_test/flutter_test.dart';

import 'package:festalink_cliente/domain/entities/reserva.dart';
import 'package:festalink_cliente/domain/entities/salao.dart';

void main() {
  test('Salao.fromJson aceita comodidades em 0/1 e em booleano', () {
    final salao = Salao.fromJson({
      'id': 1,
      'prestadorId': 2,
      'nome': 'Espaço Alegria',
      'endereco': 'Rua A, 100',
      'capacidadeMax': 80,
      'valorDiaria': 1500,
      'temEstacionamento': 1,
      'temCozinha': true,
      'permiteMusicaAoVivo': 0,
      'aceitaPets': false,
    });

    expect(salao.nome, 'Espaço Alegria');
    expect(salao.capacidadeMax, 80);
    expect(salao.temEstacionamento, isTrue);
    expect(salao.temCozinha, isTrue);
    expect(salao.permiteMusicaAoVivo, isFalse);
    expect(salao.aceitaPets, isFalse);
  });

  test('Reserva expõe atalhos de status', () {
    final reserva = Reserva.fromJson({
      'id': 10,
      'clienteId': 2,
      'salaoId': 1,
      'dataEvento': '2026-07-10',
      'horaInicio': '19:00',
      'horaFim': '23:00',
      'status': 'aprovada',
    });

    expect(reserva.aprovada, isTrue);
    expect(reserva.pendente, isFalse);
  });
}
