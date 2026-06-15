import '../entities/reserva.dart';

abstract class ReservaRepository {
  Future<Reserva> criar({
    required int salaoId,
    required String dataEvento,
    required String horaInicio,
    required String horaFim,
  });

  Future<List<Reserva>> listarMinhas();

  Future<Reserva> cancelar(int reservaId);
}
