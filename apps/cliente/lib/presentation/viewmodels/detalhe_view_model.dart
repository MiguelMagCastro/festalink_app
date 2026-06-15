import 'package:flutter/foundation.dart';

import '../../core/api_exception.dart';
import '../../domain/entities/detalhe_salao.dart';
import '../../domain/repositories/salao_repository.dart';

class DetalheViewModel extends ChangeNotifier {
  DetalheViewModel(this._repo);

  final SalaoRepository _repo;

  bool _carregando = false;
  String? _erro;
  DetalheSalao? _detalhe;

  bool get carregando => _carregando;
  String? get erro => _erro;
  DetalheSalao? get detalhe => _detalhe;

  Future<void> carregar(int salaoId) async {
    _carregando = true;
    _erro = null;
    notifyListeners();
    try {
      _detalhe = await _repo.obterDetalhe(salaoId);
    } on ApiException catch (e) {
      _erro = e.mensagem;
    } finally {
      _carregando = false;
      notifyListeners();
    }
  }
}
