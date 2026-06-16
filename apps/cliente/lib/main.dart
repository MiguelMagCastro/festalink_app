import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/api_client.dart';
import 'core/session_store.dart';
import 'data/datasources/auth_api.dart';
import 'data/datasources/reserva_api.dart';
import 'data/datasources/salao_api.dart';
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/reserva_repository_impl.dart';
import 'data/repositories/salao_repository_impl.dart';
import 'domain/repositories/reserva_repository.dart';
import 'domain/repositories/salao_repository.dart';
import 'presentation/screens/home_screen.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/viewmodels/auth_view_model.dart';
import 'presentation/viewmodels/reservas_view_model.dart';
import 'presentation/viewmodels/saloes_view_model.dart';

void main() {
  // Necessário porque restauramos a sessão (SharedPreferences) antes do runApp.
  WidgetsFlutterBinding.ensureInitialized();

  final apiClient = ApiClient();
  final sessionStore = SessionStore();

  final authRepository = AuthRepositoryImpl(AuthApi(apiClient));
  final SalaoRepository salaoRepository = SalaoRepositoryImpl(SalaoApi(apiClient));
  final ReservaRepository reservaRepository =
      ReservaRepositoryImpl(ReservaApi(apiClient));

  final authViewModel = AuthViewModel(
    apiClient: apiClient,
    repository: authRepository,
    store: sessionStore,
  );
  // Token rejeitado numa chamada autenticada -> encerra a sessão e volta ao login.
  apiClient.aoExpirarSessao(authViewModel.sair);
  authViewModel.restaurarSessao();

  runApp(FestaLinkApp(
    authViewModel: authViewModel,
    salaoRepository: salaoRepository,
    reservaRepository: reservaRepository,
  ));
}

class FestaLinkApp extends StatelessWidget {
  const FestaLinkApp({
    super.key,
    required this.authViewModel,
    required this.salaoRepository,
    required this.reservaRepository,
  });

  final AuthViewModel authViewModel;
  final SalaoRepository salaoRepository;
  final ReservaRepository reservaRepository;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<SalaoRepository>.value(value: salaoRepository),
        Provider<ReservaRepository>.value(value: reservaRepository),
        ChangeNotifierProvider<AuthViewModel>.value(value: authViewModel),
        ChangeNotifierProvider<SaloesViewModel>(
          create: (_) => SaloesViewModel(salaoRepository),
        ),
        ChangeNotifierProvider<ReservasViewModel>(
          create: (_) => ReservasViewModel(reservaRepository),
        ),
      ],
      child: MaterialApp(
        title: 'FestaLink',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorSchemeSeed: const Color(0xFF6A1B9A),
          useMaterial3: true,
        ),
        home: const _Raiz(),
      ),
    );
  }
}

class _Raiz extends StatelessWidget {
  const _Raiz();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthViewModel>();
    if (auth.inicializando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return auth.autenticado ? const HomeScreen() : const LoginScreen();
  }
}
