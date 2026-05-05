require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'festalink-backend' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`festalink api on :${port}`);
});
