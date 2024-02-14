// ------- v1 ---------
import Example from './Example.js';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);
  obj.init();
};
// --------------------





// ------- v4 ---------
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import express from 'express';
// import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


// const app = express()
// const port = process.env.PORT || 4000;

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
// --------------------



// ------- v3 ---------
// const express = require('express');

// const app = express();
// const port = process.env.PORT || 4000;

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
// --------------------


// ------- v2 ---------
// const express = require('express');
// const path = require('path');

// const app = express();

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
// --------------------