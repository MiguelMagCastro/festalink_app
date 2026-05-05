require('dotenv').config();
const express = require('express');
const { openDatabase } = require('./db/init');
const { compor } = require('./composition');
const { criarAuthRoutes } = require('./routes/auth.routes');
const { errorHandler } = require('./middleware/errorHandler');

openDatabase();
const ctx = compor();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'festalink-backend' });
});

app.use('/auth', criarAuthRoutes({
  authController: ctx.controllers.authController,
  autenticar: ctx.middlewares.autenticar,
}));

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`festalink api on :${port}`);
});
