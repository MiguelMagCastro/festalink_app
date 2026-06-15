import '../../domain/entities/reserva.dart';
import '../../domain/repositories/reserva_repository.dart';
import '../datasources/reserva_api.dart';

class ReservaRepositoryImpl implements ReservaRepository {
  ReservaRepositoryImpl(this._api);

  final ReservaApi _api;

  @override
  Future<Reserva> criar({
    required int salaoId,
    required String dataEvento,
    required String horaInicio,
    required String horaFim,
  }) =>
      _api.criar(
        salaoId: salaoId,
        dataEvento: dataEvento,
        horaInicio: horaInicio,
        horaFim: horaFim,
      );

  @override
  Future<List<Reserva>> listarMinhas() => _api.minhas();

  @override
  Future<Reserva> cancelar(int reservaId) => _api.cancelar(reservaId);
}
