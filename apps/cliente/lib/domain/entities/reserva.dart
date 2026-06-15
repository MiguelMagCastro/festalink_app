class Reserva {
  const Reserva({
    required this.id,
    required this.clienteId,
    required this.salaoId,
    required this.dataEvento,
    required this.horaInicio,
    required this.horaFim,
    required this.status,
  });

  final int id;
  final int clienteId;
  final int salaoId;
  final String dataEvento;
  final String horaInicio;
  final String horaFim;
  final String status;

  bool get pendente => status == 'pendente';
  bool get aprovada => status == 'aprovada';
  bool get recusada => status == 'recusada';
  bool get cancelada => status == 'cancelada';

  factory Reserva.fromJson(Map<String, dynamic> json) => Reserva(
        id: json['id'] as int,
        clienteId: json['clienteId'] as int? ?? 0,
        salaoId: json['salaoId'] as int,
        dataEvento: json['dataEvento'] as String? ?? '',
        horaInicio: json['horaInicio'] as String? ?? '',
        horaFim: json['horaFim'] as String? ?? '',
        status: json['status'] as String? ?? 'pendente',
      );
}
