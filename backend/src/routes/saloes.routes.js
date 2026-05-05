const express = require('express');

function criarSaloesRoutes({ salaoController, autenticar, exigirPapel }) {
  const router = express.Router();

  router.get('/', autenticar,
    (req, res, next) => salaoController.listar(req, res, next));

  router.get('/meus', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.meus(req, res, next));

  router.get('/:id', autenticar,
    (req, res, next) => salaoController.obter(req, res, next));

  router.post('/', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.criar(req, res, next));

  router.put('/:id', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.atualizar(req, res, next));

  router.delete('/:id', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.excluir(req, res, next));

  router.put('/:id/horarios', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.putHorarios(req, res, next));

  router.post('/:id/bloqueios', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.adicionarBloqueio(req, res, next));

  router.get('/:id/bloqueios', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.listarBloqueiosDoSalao(req, res, next));

  router.delete('/:id/bloqueios/:bloqId', autenticar, exigirPapel('prestador'),
    (req, res, next) => salaoController.removerBloqueioDoSalao(req, res, next));

  return router;
}

module.exports = { criarSaloesRoutes };
