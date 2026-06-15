import '../../core/json_utils.dart';

class Salao {
  const Salao({
    required this.id,
    required this.prestadorId,
    required this.nome,
    required this.endereco,
    required this.capacidadeMax,
    required this.valorDiaria,
    this.descricao,
    this.areaM2,
    this.temEstacionamento = false,
    this.temCozinha = false,
    this.permiteMusicaAoVivo = false,
    this.aceitaPets = false,
    this.regrasAdicionais,
  });

  final int id;
  final int prestadorId;
  final String nome;
  final String? descricao;
  final String endereco;
  final int capacidadeMax;
  final num valorDiaria;
  final num? areaM2;
  final bool temEstacionamento;
  final bool temCozinha;
  final bool permiteMusicaAoVivo;
  final bool aceitaPets;
  final String? regrasAdicionais;

  factory Salao.fromJson(Map<String, dynamic> json) => Salao(
        id: json['id'] as int,
        prestadorId: json['prestadorId'] as int? ?? 0,
        nome: json['nome'] as String? ?? 'Salão',
        descricao: json['descricao'] as String?,
        endereco: json['endereco'] as String? ?? '',
        capacidadeMax: (json['capacidadeMax'] as num?)?.toInt() ?? 0,
        valorDiaria: (json['valorDiaria'] as num?) ?? 0,
        areaM2: json['areaM2'] as num?,
        temEstacionamento: lerBool(json['temEstacionamento']),
        temCozinha: lerBool(json['temCozinha']),
        permiteMusicaAoVivo: lerBool(json['permiteMusicaAoVivo']),
        aceitaPets: lerBool(json['aceitaPets']),
        regrasAdicionais: json['regrasAdicionais'] as String?,
      );
}
