import '../../domain/entities/usuario.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_api.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._api);

  final AuthApi _api;

  @override
  Future<({String token, Usuario usuario})> login({
    required String email,
    required String senha,
  }) =>
      _api.login(email: email, senha: senha);

  @override
  Future<Usuario> registrar({
    required String nome,
    required String email,
    required String senha,
  }) =>
      _api.registrar(nome: nome, email: email, senha: senha);
}
