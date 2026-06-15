import '../entities/usuario.dart';

abstract class AuthRepository {
  Future<({String token, Usuario usuario})> login({
    required String email,
    required String senha,
  });

  Future<Usuario> registrar({
    required String nome,
    required String email,
    required String senha,
  });
}
