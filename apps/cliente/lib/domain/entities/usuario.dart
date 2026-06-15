class Usuario {
  const Usuario({
    required this.id,
    required this.nome,
    required this.email,
    required this.papel,
  });

  final int id;
  final String nome;
  final String email;
  final String papel;

  factory Usuario.fromJson(Map<String, dynamic> json) => Usuario(
        id: json['id'] as int,
        nome: json['nome'] as String? ?? '',
        email: json['email'] as String? ?? '',
        papel: json['papel'] as String? ?? '',
      );
}
