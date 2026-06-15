import '../../domain/entities/avaliacao.dart';
import '../../domain/entities/bloqueio.dart';
import '../../domain/entities/detalhe_salao.dart';
import '../../domain/entities/horario.dart';
import '../../domain/entities/salao.dart';
import '../../domain/repositories/salao_repository.dart';
import '../datasources/salao_api.dart';

class SalaoRepositoryImpl implements SalaoRepository {
  SalaoRepositoryImpl(this._api);

  final SalaoApi _api;

  @override
  Future<List<Salao>> listar() => _api.listar();

  @override
  Future<DetalheSalao> obterDetalhe(int salaoId) async {
    final resultados = await Future.wait([
      _api.obter(salaoId),
      _api.horarios(salaoId),
      _api.bloqueios(salaoId),
      _api.avaliacoes(salaoId),
    ]);
    return DetalheSalao(
      salao: resultados[0] as Salao,
      horarios: (resultados[1] as List<Horario>),
      bloqueios: (resultados[2] as List<Bloqueio>),
      avaliacoes: (resultados[3] as List<Avaliacao>),
    );
  }
}
