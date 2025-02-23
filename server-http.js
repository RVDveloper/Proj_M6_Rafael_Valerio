
const express = require('express');
const app = express();


app.use(express.static(__dirname));

const PORT = 8000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTP en ejecución en http://0.0.0.0:${PORT}`)
});        