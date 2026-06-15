import '../../core/api_client.dart';
import '../../domain/entities/reserva.dart';

class ReservaApi {
  ReservaApi(this._client);

  final ApiClient _client;

  Future<Reserva> criar({
    required int salaoId,
    required String dataEvento,
    required String horaInicio,
    required String horaFim,
  }) async {
    try {
      final resp = await _client.dio.post('/reservas', data: {
        'salaoId': salaoId,
        'dataEvento': dataEvento,
        'horaInicio': horaInicio,
        'horaFim': horaFim,
      });
      return Reserva.fromJson(resp.data as Map<String, dynamic>);
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<List<Reserva>> minhas() async {
    try {
      final resp = await _client.dio.get('/reservas/minhas');
      return (resp.data as List)
          .map((e) => Reserva.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<Reserva> cancelar(int id) async {
    try {
      final resp = await _client.dio.patch('/reservas/$id/cancelar');
      return Reserva.fromJson(resp.data as Map<String, dynamic>);
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }
}
