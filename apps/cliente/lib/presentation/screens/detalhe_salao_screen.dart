import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/formatters.dart';
import '../../domain/entities/avaliacao.dart';
import '../../domain/entities/bloqueio.dart';
import '../../domain/entities/horario.dart';
import '../../domain/entities/salao.dart';
import '../../domain/repositories/salao_repository.dart';
import '../viewmodels/detalhe_view_model.dart';
import '../widgets/estado_vazio.dart';
import 'criar_reserva_screen.dart';

class DetalheSalaoScreen extends StatelessWidget {
  const DetalheSalaoScreen({super.key, required this.salao});

  final Salao salao;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<DetalheViewModel>(
      create: (ctx) =>
          DetalheViewModel(ctx.read<SalaoRepository>())..carregar(salao.id),
      child: _DetalheView(salao: salao),
    );
  }
}

class _DetalheView extends StatelessWidget {
  const _DetalheView({required this.salao});

  final Salao salao;

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<DetalheViewModel>();
    return Scaffold(
      appBar: AppBar(title: Text(salao.nome)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => CriarReservaScreen(salao: salao)),
        ),
        icon: const Icon(Icons.event_available),
        label: const Text('Reservar'),
      ),
      body: _corpo(context, vm),
    );
  }

  Widget _corpo(BuildContext context, DetalheViewModel vm) {
    if (vm.carregando && vm.detalhe == null) {
      return const Center(child: CircularProgressIndicator());
    }
    if (vm.erro != null && vm.detalhe == null) {
      return EstadoVazio(
        icone: Icons.cloud_off,
        mensagem: vm.erro!,
        onAcao: () => vm.carregar(salao.id),
      );
    }
    final d = vm.detalhe;
    if (d == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
      children: [
        _Cabecalho(salao: d.salao),
        const SizedBox(height: 16),
        _Comodidades(salao: d.salao),
        if (d.salao.descricao != null && d.salao.descricao!.isNotEmpty) ...[
          const SizedBox(height: 16),
          _Secao(titulo: 'Descrição', child: Text(d.salao.descricao!)),
        ],
        if (d.salao.regrasAdicionais != null &&
            d.salao.regrasAdicionais!.isNotEmpty) ...[
          const SizedBox(height: 16),
          _Secao(titulo: 'Regras adicionais', child: Text(d.salao.regrasAdicionais!)),
        ],
        const SizedBox(height: 16),
        _Secao(
          titulo: 'Horário de funcionamento',
          child: _Horarios(horarios: d.horarios),
        ),
        const SizedBox(height: 16),
        _Secao(
          titulo: 'Datas indisponíveis',
          child: _Bloqueios(bloqueios: d.bloqueios),
        ),
        const SizedBox(height: 16),
        _Secao(
          titulo: 'Avaliações',
          child: _Avaliacoes(avaliacoes: d.avaliacoes),
        ),
      ],
    );
  }
}

class _Cabecalho extends StatelessWidget {
  const _Cabecalho({required this.salao});

  final Salao salao;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.place_outlined, size: 18, color: Colors.grey),
            const SizedBox(width: 4),
            Expanded(child: Text(salao.endereco)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Chip(
              avatar: const Icon(Icons.people_outline, size: 18),
              label: Text('${salao.capacidadeMax} pessoas'),
            ),
            const SizedBox(width: 8),
            if (salao.areaM2 != null)
              Chip(
                avatar: const Icon(Icons.straighten, size: 18),
                label: Text('${salao.areaM2} m²'),
              ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          '${formatarMoeda(salao.valorDiaria)} / diária',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(color: cores.primary, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

class _Comodidades extends StatelessWidget {
  const _Comodidades({required this.salao});

  final Salao salao;

  @override
  Widget build(BuildContext context) {
    final itens = <(IconData, String, bool)>[
      (Icons.local_parking, 'Estacionamento', salao.temEstacionamento),
      (Icons.restaurant, 'Cozinha', salao.temCozinha),
      (Icons.music_note, 'Música ao vivo', salao.permiteMusicaAoVivo),
      (Icons.pets, 'Aceita pets', salao.aceitaPets),
    ];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final item in itens)
          Chip(
            avatar: Icon(
              item.$1,
              size: 18,
              color: item.$3 ? Colors.green.shade700 : Colors.grey,
            ),
            label: Text(item.$2),
            backgroundColor: item.$3
                ? Colors.green.withValues(alpha: 0.10)
                : Colors.grey.withValues(alpha: 0.10),
          ),
      ],
    );
  }
}

class _Secao extends StatelessWidget {
  const _Secao({required this.titulo, required this.child});

  final String titulo;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          titulo,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}

class _Horarios extends StatelessWidget {
  const _Horarios({required this.horarios});

  final List<Horario> horarios;

  @override
  Widget build(BuildContext context) {
    if (horarios.isEmpty) {
      return const Text('Horário não informado pelo prestador.',
          style: TextStyle(color: Colors.grey));
    }
    final ordenados = [...horarios]..sort((a, b) => a.diaSemana.compareTo(b.diaSemana));
    return Column(
      children: [
        for (final h in ordenados)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(h.nomeDia),
                Text('${h.abreEm} – ${h.fechaEm}'),
              ],
            ),
          ),
      ],
    );
  }
}

class _Bloqueios extends StatelessWidget {
  const _Bloqueios({required this.bloqueios});

  final List<Bloqueio> bloqueios;

  @override
  Widget build(BuildContext context) {
    if (bloqueios.isEmpty) {
      return const Text('Sem datas bloqueadas.',
          style: TextStyle(color: Colors.grey));
    }
    return Column(
      children: [
        for (final b in bloqueios)
          ListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            leading: const Icon(Icons.event_busy, color: Colors.redAccent),
            title: Text('${formatarDataIso(b.data)} · ${b.horaInicio}–${b.horaFim}'),
            subtitle: (b.motivo != null && b.motivo!.isNotEmpty)
                ? Text(b.motivo!)
                : null,
          ),
      ],
    );
  }
}

class _Avaliacoes extends StatelessWidget {
  const _Avaliacoes({required this.avaliacoes});

  final List<Avaliacao> avaliacoes;

  @override
  Widget build(BuildContext context) {
    if (avaliacoes.isEmpty) {
      return const Text('Este salão ainda não tem avaliações.',
          style: TextStyle(color: Colors.grey));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final a in avaliacoes)
          Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Estrelas(nota: a.nota ?? 0),
                  if (a.comentario != null && a.comentario!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(a.comentario!),
                  ],
                  if (a.respostaPrestador != null &&
                      a.respostaPrestador!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Resposta do prestador',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 12)),
                          const SizedBox(height: 2),
                          Text(a.respostaPrestador!),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _Estrelas extends StatelessWidget {
  const _Estrelas({required this.nota});

  final int nota;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 1; i <= 5; i++)
          Icon(
            i <= nota ? Icons.star : Icons.star_border,
            size: 18,
            color: Colors.amber.shade700,
          ),
      ],
    );
  }
}
