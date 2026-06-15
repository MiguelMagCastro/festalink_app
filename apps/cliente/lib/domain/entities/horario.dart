class Horario {
  const Horario({
    required this.diaSemana,
    required this.abreEm,
    required this.fechaEm,
  });

  /// 0 = domingo ... 6 = sábado (mesma convenção do backend).
  final int diaSemana;
  final String abreEm;
  final String fechaEm;

  factory Horario.fromJson(Map<String, dynamic> json) => Horario(
        diaSemana: (json['diaSemana'] as num).toInt(),
        abreEm: json['abreEm'] as String? ?? '',
        fechaEm: json['fechaEm'] as String? ?? '',
      );

  static const _nomes = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  String get nomeDia =>
      (diaSemana >= 0 && diaSemana < 7) ? _nomes[diaSemana] : 'Dia $diaSemana';
}
