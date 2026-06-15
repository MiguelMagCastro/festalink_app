import 'package:shared_preferences/shared_preferences.dart';

class DadosSessao {
  DadosSessao({required this.token, required this.usuarioId, required this.nome});

  final String token;
  final int usuarioId;
  final String nome;
}

/// Persiste a sessão do cliente entre execuções do app.
class SessionStore {
  static const _kToken = 'festalink_token';
  static const _kId = 'festalink_usuario_id';
  static const _kNome = 'festalink_usuario_nome';

  Future<void> salvar(DadosSessao dados) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kToken, dados.token);
    await prefs.setInt(_kId, dados.usuarioId);
    await prefs.setString(_kNome, dados.nome);
  }

  Future<DadosSessao?> ler() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_kToken);
    final id = prefs.getInt(_kId);
    if (token == null || id == null) return null;
    return DadosSessao(
      token: token,
      usuarioId: id,
      nome: prefs.getString(_kNome) ?? '',
    );
  }

  Future<void> limpar() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kToken);
    await prefs.remove(_kId);
    await prefs.remove(_kNome);
  }
}
