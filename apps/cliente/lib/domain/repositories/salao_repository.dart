import '../entities/detalhe_salao.dart';
import '../entities/salao.dart';

abstract class SalaoRepository {
  Future<List<Salao>> listar();
  Future<DetalheSalao> obterDetalhe(int salaoId);
}
