const express = require('express');

function criarAvaliacoesRoutes({ avaliacaoController, autenticar, exigirPapel }) {
  const router = express.Router();

  router.post('/reservas/:id/avaliacao', autenticar, exigirPapel('cliente'),
    (req, res, next) => avaliacaoController.postar(req, res, next));

  router.put('/reservas/:id/avaliacao', autenticar, exigirPapel('cliente'),
    (req, res, next) => avaliacaoController.editar(req, res, next));

  router.delete('/reservas/:id/avaliacao', autenticar, exigirPapel('cliente'),
    (req, res, next) => avaliacaoController.excluir(req, res, next));

  router.get('/saloes/:id/avaliacoes', autenticar,
    (req, res, next) => avaliacaoController.listarDoSalao(req, res, next));

  router.post('/avaliacoes/:id/resposta', autenticar, exigirPapel('prestador'),
    (req, res, next) => avaliacaoController.responder(req, res, next));

  router.put('/avaliacoes/:id/resposta', autenticar, exigirPapel('prestador'),
    (req, res, next) => avaliacaoController.atualizarResposta(req, res, next));

  router.delete('/avaliacoes/:id/resposta', autenticar, exigirPapel('prestador'),
    (req, res, next) => avaliacaoController.removerResposta(req, res, next));

  return router;
}

module.exports = { criarAvaliacoesRoutes };
