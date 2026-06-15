/// Converte os valores que o backend usa para booleanos (true/false, 1/0, "1").
bool lerBool(dynamic valor) => valor == true || valor == 1 || valor == '1';
