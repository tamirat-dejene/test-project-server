import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { getMusics, getMusic, updateMusic, createMusic, deleteMusic } from './actions.js';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

const app = express();
const PORT = process.env.PORT || 9001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (_, res) => {
  // send index.html from public folder
  res.send(`
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test-Project-Serverless</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }

        h1 {
          color: #007bff;
          text-align: center;
          margin-bottom: 20px;
        }

        p {
          background-color: #fff;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 10px 0;
        }

        code {
          background-color: #e7e7e7;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 1.1em;
          color: #d63384;
        }
      </style>
    </head>

    <body>
      <h1>Welcome to the Music API</h1>
      <p>Use the <code>/musics</code> endpoint to get music data</p>
      <p>Use the <code>/musics?q=searchparam&o=orderby</code> endpoint to search music data</p>
      <p>Use the <code>/musics/:id</code> endpoint to get a single music data</p>
      <p>Use the <code>/musics</code> endpoint with <code>POST</code> to create a new music</p>
      <p>Use the <code>/musics/:id</code> endpoint with <code>PUT</code> to update a music</p>
      <p>Use the <code>/musics/:id</code> endpoint with <code>DELETE</code> to delete a music</p>
    </body>

    </html>
  `)
});


// http://localhost:3000/musics?q=love&o=artist
app.get('/musics', async (req, res) => {
  try {
    const musics = await getMusics(req.query.q, req.query.o);
    res.json(musics);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/musics/:id', async (req, res) => {
  try {
  const music = await getMusic(parseInt(req.params.id));
  if (music) res.json(music);
    else res.status(404).send('Music not found');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/musics', async (req, res) => {
  try {
    const music = await createMusic(req.body);
    res.json(music);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put('/musics/:id', async (req, res) => {
  try {
    const music = await updateMusic(parseInt(req.params.id), req.body);
    res.json(music);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/musics/:id', async (req, res) => {

  try {
    const result = await deleteMusic(parseInt(req.params.id));
    if (result) {
      res.send('Music deleted');
    } else {
      res.status(404).send('Music not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT || 9002, () => {
  console.log(`Server listening on port ${PORT}`);
});


export default app;