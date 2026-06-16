import 'package:dio/dio.dart';

import 'api_exception.dart';
import 'config.dart';

/// Cliente HTTP único do app. Mantém o token JWT em memória e o injeta em todas
/// as requisições; também traduz as falhas do Dio em [ApiException].
class ApiClient {
  ApiClient({String? baseUrl})
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? AppConfig.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          contentType: 'application/json',
        )) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = _token;
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (erro, handler) {
        // 401 numa requisição que levava token = sessão expirada/inválida.
        // O 401 do login não tem token, então não dispara o logout.
        final tinhaToken =
            erro.requestOptions.headers.containsKey('Authorization');
        if (erro.response?.statusCode == 401 && tinhaToken) {
          _aoExpirarSessao?.call();
        }
        handler.next(erro);
      },
    ));
  }

  final Dio dio;
  String? _token;
  void Function()? _aoExpirarSessao;

  void definirToken(String? token) => _token = token;

  /// Registra o que fazer quando o token é rejeitado (HTTP 401) numa chamada
  /// autenticada — usado para encerrar a sessão e voltar ao login.
  void aoExpirarSessao(void Function() callback) => _aoExpirarSessao = callback;

  ApiException mapearErro(Object erro) {
    if (erro is ApiException) return erro;
    if (erro is DioException) {
      final status = erro.response?.statusCode;
      final data = erro.response?.data;
      if (data is Map && data['error'] is String) {
        return ApiException(data['error'] as String, status: status);
      }
      switch (erro.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
        case DioExceptionType.sendTimeout:
          return ApiException('Tempo de conexão esgotado. A API está no ar?',
              status: status);
        case DioExceptionType.connectionError:
          return ApiException(
              'Não foi possível conectar à API. Confira a rede e o endereço.',
              status: status);
        default:
          return ApiException('Falha na comunicação com a API.', status: status);
      }
    }
    return ApiException('Erro inesperado: $erro');
  }
}
