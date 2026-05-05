const express = require('express');

function criarReservasRoutes({ reservaController, autenticar, exigirPapel }) {
  const router = express.Router();

  router.post('/', autenticar, exigirPapel('cliente'),
    (req, res, next) => reservaController.criar(req, res, next));

  router.get('/minhas', autenticar, exigirPapel('cliente'),
    (req, res, next) => reservaController.minhas(req, res, next));

  router.get('/recebidas', autenticar, exigirPapel('prestador'),
    (req, res, next) => reservaController.recebidas(req, res, next));

  router.patch('/:id/aprovar', autenticar, exigirPapel('prestador'),
    (req, res, next) => reservaController.aprovar(req, res, next));

  router.patch('/:id/recusar', autenticar, exigirPapel('prestador'),
    (req, res, next) => reservaController.recusar(req, res, next));

  router.patch('/:id/cancelar', autenticar,
    (req, res, next) => reservaController.cancelar(req, res, next));

  return router;
}

module.exports = { criarReservasRoutes };
