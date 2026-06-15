class Bloqueio {
  const Bloqueio({
    required this.id,
    required this.data,
    required this.horaInicio,
    required this.horaFim,
    this.motivo,
  });

  final int id;
  final String data;
  final String horaInicio;
  final String horaFim;
  final String? motivo;

  factory Bloqueio.fromJson(Map<String, dynamic> json) => Bloqueio(
        id: json['id'] as int,
        data: json['data'] as String? ?? '',
        horaInicio: json['horaInicio'] as String? ?? '',
        horaFim: json['horaFim'] as String? ?? '',
        motivo: json['motivo'] as String?,
      );
}
