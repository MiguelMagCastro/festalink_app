class Avaliacao {
  const Avaliacao({
    required this.id,
    required this.reservaId,
    this.nota,
    this.comentario,
    this.respostaPrestador,
  });

  final int id;
  final int reservaId;
  final int? nota;
  final String? comentario;
  final String? respostaPrestador;

  factory Avaliacao.fromJson(Map<String, dynamic> json) => Avaliacao(
        id: json['id'] as int,
        reservaId: json['reservaId'] as int? ?? 0,
        nota: (json['nota'] as num?)?.toInt(),
        comentario: json['comentario'] as String?,
        respostaPrestador: json['respostaPrestador'] as String?,
      );
}
