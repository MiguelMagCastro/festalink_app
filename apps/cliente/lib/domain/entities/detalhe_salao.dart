import 'avaliacao.dart';
import 'bloqueio.dart';
import 'horario.dart';
import 'salao.dart';

/// Agrega tudo que a tela de detalhes precisa de um salão.
class DetalheSalao {
  const DetalheSalao({
    required this.salao,
    required this.horarios,
    required this.bloqueios,
    required this.avaliacoes,
  });

  final Salao salao;
  final List<Horario> horarios;
  final List<Bloqueio> bloqueios;
  final List<Avaliacao> avaliacoes;
}
