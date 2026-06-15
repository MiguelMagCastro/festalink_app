import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  const StatusChip(this.status, {super.key});

  final String status;

  @override
  Widget build(BuildContext context) {
    final estilo = _estilo(status);
    return Chip(
      visualDensity: VisualDensity.compact,
      backgroundColor: estilo.cor.withValues(alpha: 0.15),
      side: BorderSide(color: estilo.cor.withValues(alpha: 0.5)),
      avatar: Icon(estilo.icone, size: 16, color: estilo.cor),
      label: Text(
        estilo.rotulo,
        style: TextStyle(color: estilo.cor, fontWeight: FontWeight.w600),
      ),
    );
  }

  _EstiloStatus _estilo(String s) {
    switch (s) {
      case 'aprovada':
        return _EstiloStatus(Colors.green.shade700, 'Aprovada', Icons.check_circle);
      case 'recusada':
        return _EstiloStatus(Colors.red.shade700, 'Recusada', Icons.cancel);
      case 'cancelada':
        return _EstiloStatus(Colors.grey.shade700, 'Cancelada', Icons.do_not_disturb_on);
      default:
        return _EstiloStatus(Colors.orange.shade800, 'Pendente', Icons.hourglass_top);
    }
  }
}

class _EstiloStatus {
  _EstiloStatus(this.cor, this.rotulo, this.icone);
  final Color cor;
  final String rotulo;
  final IconData icone;
}
