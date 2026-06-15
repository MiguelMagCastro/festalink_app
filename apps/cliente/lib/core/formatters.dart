String formatarMoeda(num valor) {
  final inteiro = valor.floor();
  final centavos = ((valor - inteiro) * 100).round().toString().padLeft(2, '0');
  final texto = inteiro.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < texto.length; i++) {
    if (i > 0 && (texto.length - i) % 3 == 0) buffer.write('.');
    buffer.write(texto[i]);
  }
  return 'R\$ $buffer,$centavos';
}

/// Converte uma data ISO `YYYY-MM-DD` para `DD/MM/YYYY`.
String formatarDataIso(String iso) {
  final partes = iso.split('-');
  if (partes.length != 3) return iso;
  return '${partes[2]}/${partes[1]}/${partes[0]}';
}

String duasCasas(int valor) => valor.toString().padLeft(2, '0');

String dataParaIso(DateTime data) =>
    '${data.year}-${duasCasas(data.month)}-${duasCasas(data.day)}';
