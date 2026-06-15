import 'package:flutter/material.dart';

class EstadoVazio extends StatelessWidget {
  const EstadoVazio({
    super.key,
    required this.icone,
    required this.mensagem,
    this.onAcao,
    this.rotuloAcao,
  });

  final IconData icone;
  final String mensagem;
  final VoidCallback? onAcao;
  final String? rotuloAcao;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icone, size: 56, color: Colors.grey),
            const SizedBox(height: 12),
            Text(mensagem, textAlign: TextAlign.center),
            if (onAcao != null) ...[
              const SizedBox(height: 16),
              FilledButton.tonalIcon(
                onPressed: onAcao,
                icon: const Icon(Icons.refresh),
                label: Text(rotuloAcao ?? 'Tentar novamente'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
