import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../viewmodels/auth_view_model.dart';
import '../viewmodels/reservas_view_model.dart';
import '../viewmodels/saloes_view_model.dart';
import 'lista_saloes_screen.dart';
import 'minhas_reservas_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  int _aba = 0;
  late final ReservasViewModel _reservas;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _reservas = context.read<ReservasViewModel>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final saloes = context.read<SaloesViewModel>();
      saloes.carregar();
      _reservas.carregar();
      _reservas.iniciarPolling();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _reservas.pararPolling();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _reservas.carregar(silencioso: true);
      _reservas.iniciarPolling();
    } else if (state == AppLifecycleState.paused) {
      _reservas.pararPolling();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthViewModel>();
    return Scaffold(
      appBar: AppBar(
        title: Text(_aba == 0 ? 'Salões' : 'Minhas reservas'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'sair') auth.sair();
            },
            itemBuilder: (_) => [
              PopupMenuItem<String>(
                enabled: false,
                child: Text(
                  (auth.nome != null && auth.nome!.isNotEmpty)
                      ? 'Olá, ${auth.nome}'
                      : 'Minha conta',
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'sair',
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.logout),
                  title: Text('Sair'),
                ),
              ),
            ],
          ),
        ],
      ),
      body: IndexedStack(
        index: _aba,
        children: const [
          ListaSaloesScreen(),
          MinhasReservasScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _aba,
        onDestinationSelected: (i) => setState(() => _aba = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.meeting_room_outlined),
            selectedIcon: Icon(Icons.meeting_room),
            label: 'Salões',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_note_outlined),
            selectedIcon: Icon(Icons.event_note),
            label: 'Reservas',
          ),
        ],
      ),
    );
  }
}
