function criarAutenticar({ tokenService }) {
  return function autenticar(req, res, next) {
    const auth = req.headers.authorization || '';
    const partes = auth.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
      return res.status(401).json({ error: 'token ausente ou em formato inválido' });
    }
    try {
      const payload = tokenService.verificar(partes[1]);
      req.usuario = { id: payload.sub, papel: payload.papel };
      return next();
    } catch (_err) {
      return res.status(401).json({ error: 'token inválido ou expirado' });
    }
  };
}

function exigirPapel(...papeisPermitidos) {
  return function (req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ error: 'não autenticado' });
    }
    if (!papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({ error: 'papel não autorizado para este recurso' });
    }
    return next();
  };
}

module.exports = { criarAutenticar, exigirPapel };
