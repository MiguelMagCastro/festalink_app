import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/api_exception.dart';
import '../../core/config.dart';
import '../../domain/entities/reserva.dart';
import '../../domain/repositories/reserva_repository.dart';

/// Mantém a lista de reservas do cliente e a sincroniza com o servidor por
/// polling — é assim que a aprovação/recusa feita pelo prestador aparece no app
/// sem o usuário precisar atualizar manualmente.
class ReservasViewModel extends ChangeNotifier {
  ReservasViewModel(this._repo);

  final ReservaRepository _repo;

  bool _carregando = false;
  String? _erro;
  List<Reserva> _reservas = [];
  Timer? _timer;

  bool get carregando => _carregando;
  String? get erro => _erro;
  List<Reserva> get reservas => _reservas;
  bool get emPolling => _timer != null;

  Future<Reserva> criar({
    required int salaoId,
    required String dataEvento,
    required String horaInicio,
    required String horaFim,
  }) async {
    final reserva = await _repo.criar(
      salaoId: salaoId,
      dataEvento: dataEvento,
      horaInicio: horaInicio,
      horaFim: horaFim,
    );
    await carregar(silencioso: true);
    return reserva;
  }

  Future<void> carregar({bool silencioso = false}) async {
    if (!silencioso) {
      _carregando = true;
      _erro = null;
      notifyListeners();
    }
    try {
      _reservas = await _repo.listarMinhas();
      _erro = null;
    } on ApiException catch (e) {
      if (!silencioso) _erro = e.mensagem;
    } finally {
      if (!silencioso) _carregando = false;
      notifyListeners();
    }
  }

  /// Retorna a mensagem de erro, ou null em caso de sucesso.
  Future<String?> cancelar(int id) async {
    try {
      await _repo.cancelar(id);
      await carregar(silencioso: true);
      return null;
    } on ApiException catch (e) {
      return e.mensagem;
    }
  }

  void iniciarPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(
      AppConfig.intervaloPolling,
      (_) => carregar(silencioso: true),
    );
    notifyListeners();
  }

  void pararPolling() {
    _timer?.cancel();
    _timer = null;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
