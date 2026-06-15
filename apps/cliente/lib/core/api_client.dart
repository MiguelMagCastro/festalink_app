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
    ));
  }

  final Dio dio;
  String? _token;

  void definirToken(String? token) => _token = token;

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
