import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/formatters.dart';
import '../../domain/entities/salao.dart';
import '../viewmodels/saloes_view_model.dart';
import '../widgets/estado_vazio.dart';
import 'detalhe_salao_screen.dart';

class ListaSaloesScreen extends StatelessWidget {
  const ListaSaloesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<SaloesViewModel>();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
          child: TextField(
            onChanged: vm.filtrar,
            decoration: InputDecoration(
              hintText: 'Buscar por nome ou endereço',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              isDense: true,
            ),
          ),
        ),
        Expanded(child: _corpo(context, vm)),
      ],
    );
  }

  Widget _corpo(BuildContext context, SaloesViewModel vm) {
    if (vm.carregando && vm.saloes.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (vm.erro != null && vm.saloes.isEmpty) {
      return EstadoVazio(
        icone: Icons.cloud_off,
        mensagem: vm.erro!,
        onAcao: vm.carregar,
      );
    }
    final saloes = vm.saloes;
    if (saloes.isEmpty) {
      return EstadoVazio(
        icone: Icons.meeting_room_outlined,
        mensagem: vm.filtro.isEmpty
            ? 'Nenhum salão disponível no momento.'
            : 'Nenhum salão encontrado para "${vm.filtro}".',
        onAcao: vm.carregar,
        rotuloAcao: 'Recarregar',
      );
    }
    return RefreshIndicator(
      onRefresh: vm.carregar,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
        itemCount: saloes.length,
        itemBuilder: (_, i) => _SalaoCard(salao: saloes[i]),
      ),
    );
  }
}

class _SalaoCard extends StatelessWidget {
  const _SalaoCard({required this.salao});

  final Salao salao;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => DetalheSalaoScreen(salao: salao),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                salao.nome,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.place_outlined, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      salao.endereco,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _Info(icone: Icons.people_outline, texto: '${salao.capacidadeMax} pessoas'),
                  const SizedBox(width: 16),
                  _Info(
                    icone: Icons.payments_outlined,
                    texto: '${formatarMoeda(salao.valorDiaria)} / diária',
                    cor: cores.primary,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Info extends StatelessWidget {
  const _Info({required this.icone, required this.texto, this.cor});

  final IconData icone;
  final String texto;
  final Color? cor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icone, size: 16, color: cor ?? Colors.grey.shade700),
        const SizedBox(width: 4),
        Text(
          texto,
          style: TextStyle(
            color: cor ?? Colors.grey.shade800,
            fontWeight: cor != null ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
