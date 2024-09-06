import express from 'express';
import { createMusic, deleteMusic, getMusic, getMusics, updateMusic, verifyToken, } from '../actions.js';

const router = express.Router();
const access_token_secret = process.env.AUTH_ACCESS_TOKEN_SECRET;

// http://localhost:3000/musics?q=love&o=artist
router.get('/', async (req, res) => {
  try {
    // Authorize
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyToken(token, access_token_secret);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const musics = await getMusics(req.query.q, req.query.o);
    res.json(musics);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Authorize
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyToken(token, access_token_secret);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const music = await getMusic(parseInt(req.params.id));
    if (music) res.json(music);
    else res.status(404).json({ message: 'Music not found' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/', async (req, res) => {
  try {
    // Authorize
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyToken(token, access_token_secret);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const music = await createMusic(req.body);
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Authorize
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyToken(token, access_token_secret);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const music = await updateMusic(parseInt(req.params.id), req.body);
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Authorize
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await verifyToken(token, access_token_secret);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
    
    const result = await deleteMusic(parseInt(req.params.id));
    if (result) {
      res.json({ message: 'Music deleted' });
    } else {
      res.status(404).json({ message: 'Music not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
