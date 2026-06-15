import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_exception.dart';
import '../../core/formatters.dart';
import '../../domain/entities/salao.dart';
import '../viewmodels/reservas_view_model.dart';

class CriarReservaScreen extends StatefulWidget {
  const CriarReservaScreen({super.key, required this.salao});

  final Salao salao;

  @override
  State<CriarReservaScreen> createState() => _CriarReservaScreenState();
}

class _CriarReservaScreenState extends State<CriarReservaScreen> {
  DateTime? _data;
  TimeOfDay? _inicio;
  TimeOfDay? _fim;
  bool _enviando = false;

  String _hhmm(TimeOfDay t) =>
      '${duasCasas(t.hour)}:${duasCasas(t.minute)}';

  Future<void> _escolherData() async {
    final hoje = DateTime.now();
    final data = await showDatePicker(
      context: context,
      initialDate: _data ?? hoje,
      firstDate: DateTime(hoje.year, hoje.month, hoje.day),
      lastDate: DateTime(hoje.year + 1, hoje.month, hoje.day),
      helpText: 'Data do evento',
    );
    if (data != null) setState(() => _data = data);
  }

  Future<void> _escolherHora({required bool inicio}) async {
    final hora = await showTimePicker(
      context: context,
      initialTime: (inicio ? _inicio : _fim) ??
          TimeOfDay(hour: inicio ? 18 : 23, minute: 0),
      helpText: inicio ? 'Horário de início' : 'Horário de término',
    );
    if (hora != null) {
      setState(() {
        if (inicio) {
          _inicio = hora;
        } else {
          _fim = hora;
        }
      });
    }
  }

  String? _validar() {
    if (_data == null) return 'Escolha a data do evento.';
    if (_inicio == null || _fim == null) {
      return 'Escolha o horário de início e de término.';
    }
    final inicioMin = _inicio!.hour * 60 + _inicio!.minute;
    final fimMin = _fim!.hour * 60 + _fim!.minute;
    if (fimMin <= inicioMin) {
      return 'O término precisa ser depois do início.';
    }
    return null;
  }

  Future<void> _enviar() async {
    final erro = _validar();
    if (erro != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(erro)));
      return;
    }
    setState(() => _enviando = true);
    final vm = context.read<ReservasViewModel>();
    try {
      await vm.criar(
        salaoId: widget.salao.id,
        dataEvento: dataParaIso(_data!),
        horaInicio: _hhmm(_inicio!),
        horaFim: _hhmm(_fim!),
      );
      if (!mounted) return;
      await _mostrarSucesso();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.mensagem), backgroundColor: Colors.red.shade700),
      );
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  Future<void> _mostrarSucesso() async {
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 40),
        title: const Text('Reserva solicitada'),
        content: const Text(
          'Seu pedido foi enviado e está pendente de aprovação do prestador. '
          'Acompanhe pela aba "Reservas" — o status atualiza sozinho.',
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Entendi'),
          ),
        ],
      ),
    );
    if (mounted) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nova reserva')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.meeting_room),
              title: Text(widget.salao.nome),
              subtitle: Text(widget.salao.endereco),
            ),
          ),
          const SizedBox(height: 16),
          _Campo(
            icone: Icons.calendar_today,
            rotulo: 'Data do evento',
            valor: _data == null ? 'Selecionar' : formatarDataIso(dataParaIso(_data!)),
            onTap: _escolherData,
          ),
          const SizedBox(height: 12),
          _Campo(
            icone: Icons.schedule,
            rotulo: 'Início',
            valor: _inicio == null ? 'Selecionar' : _hhmm(_inicio!),
            onTap: () => _escolherHora(inicio: true),
          ),
          const SizedBox(height: 12),
          _Campo(
            icone: Icons.schedule_outlined,
            rotulo: 'Término',
            valor: _fim == null ? 'Selecionar' : _hhmm(_fim!),
            onTap: () => _escolherHora(inicio: false),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _enviando ? null : _enviar,
            icon: _enviando
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send),
            label: Text(_enviando ? 'Enviando...' : 'Solicitar reserva'),
          ),
        ],
      ),
    );
  }
}

class _Campo extends StatelessWidget {
  const _Campo({
    required this.icone,
    required this.rotulo,
    required this.valor,
    required this.onTap,
  });

  final IconData icone;
  final String rotulo;
  final String valor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: ListTile(
        leading: Icon(icone),
        title: Text(rotulo),
        subtitle: Text(valor),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
