import '../../core/api_client.dart';
import '../../domain/entities/usuario.dart';

class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<({String token, Usuario usuario})> login({
    required String email,
    required String senha,
  }) async {
    try {
      final resp = await _client.dio
          .post('/auth/login', data: {'email': email, 'senha': senha});
      final data = resp.data as Map<String, dynamic>;
      return (
        token: data['token'] as String,
        usuario: Usuario.fromJson(data['usuario'] as Map<String, dynamic>),
      );
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }

  Future<Usuario> registrar({
    required String nome,
    required String email,
    required String senha,
  }) async {
    try {
      final resp = await _client.dio.post('/auth/registrar', data: {
        'nome': nome,
        'email': email,
        'senha': senha,
        'papel': 'cliente',
      });
      return Usuario.fromJson(resp.data as Map<String, dynamic>);
    } catch (e) {
      throw _client.mapearErro(e);
    }
  }
}
