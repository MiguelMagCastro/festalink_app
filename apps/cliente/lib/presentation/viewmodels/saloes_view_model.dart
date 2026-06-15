import 'package:flutter/foundation.dart';

import '../../core/api_exception.dart';
import '../../domain/entities/salao.dart';
import '../../domain/repositories/salao_repository.dart';

class SaloesViewModel extends ChangeNotifier {
  SaloesViewModel(this._repo);

  final SalaoRepository _repo;

  bool _carregando = false;
  String? _erro;
  List<Salao> _saloes = [];
  String _filtro = '';

  bool get carregando => _carregando;
  String? get erro => _erro;
  String get filtro => _filtro;

  List<Salao> get saloes {
    final q = _filtro.trim().toLowerCase();
    if (q.isEmpty) return _saloes;
    return _saloes
        .where((s) =>
            s.nome.toLowerCase().contains(q) ||
            s.endereco.toLowerCase().contains(q))
        .toList();
  }

  /// Usado pela tela de reservas para resolver o nome do salão a partir do id.
  String nomeDoSalao(int id) {
    for (final s in _saloes) {
      if (s.id == id) return s.nome;
    }
    return 'Salão #$id';
  }

  void filtrar(String valor) {
    _filtro = valor;
    notifyListeners();
  }

  Future<void> carregar() async {
    _carregando = true;
    _erro = null;
    notifyListeners();
    try {
      _saloes = await _repo.listar();
    } on ApiException catch (e) {
      _erro = e.mensagem;
    } finally {
      _carregando = false;
      notifyListeners();
    }
  }
}
