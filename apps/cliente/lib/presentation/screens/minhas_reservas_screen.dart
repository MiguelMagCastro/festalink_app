import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/formatters.dart';
import '../../domain/entities/reserva.dart';
import '../viewmodels/reservas_view_model.dart';
import '../viewmodels/saloes_view_model.dart';
import '../widgets/estado_vazio.dart';
import '../widgets/status_chip.dart';

class MinhasReservasScreen extends StatelessWidget {
  const MinhasReservasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<ReservasViewModel>();
    final saloes = context.watch<SaloesViewModel>();

    if (vm.carregando && vm.reservas.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (vm.erro != null && vm.reservas.isEmpty) {
      return EstadoVazio(
        icone: Icons.cloud_off,
        mensagem: vm.erro!,
        onAcao: vm.carregar,
      );
    }
    if (vm.reservas.isEmpty) {
      return const EstadoVazio(
        icone: Icons.event_busy,
        mensagem: 'Você ainda não fez reservas.\nEscolha um salão na aba "Salões".',
      );
    }

    final reservas = [...vm.reservas]
      ..sort((a, b) => b.dataEvento.compareTo(a.dataEvento));

    return RefreshIndicator(
      onRefresh: vm.carregar,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
        children: [
          if (vm.emPolling)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
              child: Row(
                children: [
                  Icon(Icons.sync, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Atualiza sozinho quando o prestador aprova ou recusa.',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          for (final r in reservas)
            _ReservaCard(reserva: r, nomeSalao: saloes.nomeDoSalao(r.salaoId)),
        ],
      ),
    );
  }
}

class _ReservaCard extends StatelessWidget {
  const _ReservaCard({required this.reserva, required this.nomeSalao});

  final Reserva reserva;
  final String nomeSalao;

  bool get _podeCancelar => reserva.pendente || reserva.aprovada;

  Future<void> _cancelar(BuildContext context) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancelar reserva'),
        content: const Text('Deseja realmente cancelar esta reserva?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Não'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim, cancelar'),
          ),
        ],
      ),
    );
    if (confirmar != true || !context.mounted) return;
    final vm = context.read<ReservasViewModel>();
    final erro = await vm.cancelar(reserva.id);
    if (context.mounted && erro != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(erro), backgroundColor: Colors.red.shade700),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    nomeSalao,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                StatusChip(reserva.status),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 6),
                Text(formatarDataIso(reserva.dataEvento)),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.schedule, size: 16, color: Colors.grey),
                const SizedBox(width: 6),
                Text('${reserva.horaInicio} – ${reserva.horaFim}'),
              ],
            ),
            if (_podeCancelar) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => _cancelar(context),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Cancelar'),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red.shade700,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
