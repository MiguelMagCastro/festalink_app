const express = require('express');

function criarAuthRoutes({ authController, autenticar }) {
  const router = express.Router();

  router.post('/registrar', (req, res, next) => authController.registrar(req, res, next));
  router.post('/login', (req, res, next) => authController.fazerLogin(req, res, next));
  router.get('/me', autenticar, (req, res, next) => authController.eu(req, res, next));

  return router;
}

module.exports = { criarAuthRoutes };
