import 'package:flutter/foundation.dart';

import '../../core/api_client.dart';
import '../../core/api_exception.dart';
import '../../core/session_store.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthViewModel extends ChangeNotifier {
  AuthViewModel({
    required ApiClient apiClient,
    required AuthRepository repository,
    required SessionStore store,
  })  : _apiClient = apiClient,
        _repo = repository,
        _store = store;

  final ApiClient _apiClient;
  final AuthRepository _repo;
  final SessionStore _store;

  bool _autenticado = false;
  bool _carregando = false;
  bool _inicializando = true;
  String? _nome;
  String? _erro;

  bool get autenticado => _autenticado;
  bool get carregando => _carregando;
  bool get inicializando => _inicializando;
  String? get nome => _nome;
  String? get erro => _erro;

  Future<void> restaurarSessao() async {
    final dados = await _store.ler();
    if (dados != null) {
      _apiClient.definirToken(dados.token);
      _autenticado = true;
      _nome = dados.nome;
    }
    _inicializando = false;
    notifyListeners();
  }

  Future<bool> login(String email, String senha) async {
    _setCarregando(true);
    try {
      final r = await _repo.login(email: email, senha: senha);
      await _aplicarSessao(r.token, r.usuario.id, r.usuario.nome);
      return true;
    } on ApiException catch (e) {
      _erro = e.mensagem;
      return false;
    } finally {
      _setCarregando(false);
    }
  }

  Future<bool> registrar(String nome, String email, String senha) async {
    _setCarregando(true);
    try {
      await _repo.registrar(nome: nome, email: email, senha: senha);
      final r = await _repo.login(email: email, senha: senha);
      await _aplicarSessao(r.token, r.usuario.id, r.usuario.nome);
      return true;
    } on ApiException catch (e) {
      _erro = e.mensagem;
      return false;
    } finally {
      _setCarregando(false);
    }
  }

  Future<void> sair() async {
    await _store.limpar();
    _apiClient.definirToken(null);
    _autenticado = false;
    _nome = null;
    notifyListeners();
  }

  Future<void> _aplicarSessao(String token, int id, String nome) async {
    _apiClient.definirToken(token);
    await _store.salvar(DadosSessao(token: token, usuarioId: id, nome: nome));
    _autenticado = true;
    _nome = nome;
    _erro = null;
  }

  void _setCarregando(bool valor) {
    _carregando = valor;
    if (valor) _erro = null;
    notifyListeners();
  }
}
