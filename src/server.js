import express from 'express';
import dotenv from 'dotenv';
import { getMusics, getMusic, updateMusic, createMusic, deleteMusic } from './actions.js';
dotenv.config({
  path: './.env.local'
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (_, res) => {
  res.send('Welcome to the Music API');
});

// get musics with query search q and orderBy o
// http://localhost:3000/musics?q=love&o=artist
app.get('/musics', async (req, res) => {
  const musics = await getMusics(req.query.q, req.query.o);
  res.json(musics);
});

app.get('/musics/:id', async (req, res) => {
  const music = await getMusic(parseInt(req.params.id));
  if (music) res.json(music);
  else res.status(404).send('Music not found');
});

app.post('/musics', async (req, res) => {
  const music = await createMusic();
  res.json(music);
});

app.put('/musics/:id', async (req, res) => {
  const music = await updateMusic(parseInt(req.params.id), req.body);
  res.json(music);
});

app.delete('/musics/:id', async (req, res) => {
  const result = await deleteMusic(parseInt(req.params.id));
  if (result) {
    res.send('Music deleted');
  } else {
    res.status(404).send('Music not found');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port http://${process.env.HOST}:3000`);
});