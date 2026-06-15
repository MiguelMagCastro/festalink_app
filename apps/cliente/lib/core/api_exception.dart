/// Erro de domínio da camada de rede, já com mensagem pronta para a interface.
class ApiException implements Exception {
  ApiException(this.mensagem, {this.status});

  final String mensagem;
  final int? status;

  bool get naoAutorizado => status == 401;

  @override
  String toString() => mensagem;
}
