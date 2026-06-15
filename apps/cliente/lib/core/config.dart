class AppConfig {
  AppConfig._();

  /// Endereço base da API REST do FestaLink.
  ///
  /// O emulador Android alcança o host pela 10.0.2.2. Para rodar em aparelho
  /// físico, informe o IP da máquina na rede local ao compilar:
  /// `flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3000`.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  /// Intervalo do polling que mantém a lista de reservas em dia com o servidor.
  static const Duration intervaloPolling = Duration(seconds: 8);
}
