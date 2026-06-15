import '../../core/api_client.dart';
import '../../domain/entities/avaliacao.dart';
import '../../domain/entities/bloqueio.dart';
import '../../domain/entities/horario.dart';
import '../../domain/entities/salao.dart';

class SalaoApi {
  SalaoApi(this._client);

  final ApiClient _client;

  Future<List<Salao>> listar() async {
    try {
      final resp = await _client.dio.get('/saloes');
      return (resp.data as List)
          .map((e) => Salao.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<Salao> obter(int id) async {
    try {
      final resp = await _client.dio.get('/saloes/$id');
      return Salao.fromJson(resp.data as Map<String, dynamic>);
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<List<Horario>> horarios(int id) async {
    try {
      final resp = await _client.dio.get('/saloes/$id/horarios');
      return (resp.data as List)
          .map((e) => Horario.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<List<Bloqueio>> bloqueios(int id) async {
    try {
      final resp = await _client.dio.get('/saloes/$id/bloqueios');
      return (resp.data as List)
          .map((e) => Bloqueio.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<List<Avaliacao>> avaliacoes(int id) async {
    try {
      final resp = await _client.dio.get('/saloes/$id/avaliacoes');
      return (resp.data as List)
          .map((e) => Avaliacao.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }
}
