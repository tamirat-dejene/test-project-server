import express from 'express';
import { createMusic, deleteMusic, getMusic, getMusics, updateMusic, verifyToken, } from '../actions.js';

const router = express.Router();
const access_token_secret = process.env.AUTH_ACCESS_TOKEN_SECRET;

// http://localhost:3000/musics?q=love&o=artist
router.get('/', async (req, res) => {
  try {
    // Authorize
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { isValid, newAccessToken } = await verifyToken(accessToken, refreshToken);

    if (!isValid && !newAccessToken) return res.status(401).json({ message: 'Unauthorized access' });
    if (newAccessToken) res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Fetch music data
    const musics = await getMusics(req.query.q, req.query.o);
    res.json(musics);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Authorize
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { isValid, newAccessToken } = await verifyToken(accessToken, refreshToken);

    if (!isValid && !newAccessToken) return res.status(401).json({ message: 'Unauthorized access' });
    if (newAccessToken) res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Fetch music data
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
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { isValid, newAccessToken } = await verifyToken(accessToken, refreshToken);

    if (!isValid && !newAccessToken) return res.status(401).json({ message: 'Unauthorized access' });
    if (newAccessToken) res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Create music
    const music = await createMusic(req.body);
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Authorize
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { isValid, newAccessToken } = await verifyToken(accessToken, refreshToken);

    if (!isValid && !newAccessToken) return res.status(401).json({ message: 'Unauthorized access' });
    if (newAccessToken) res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Update music
    const music = await updateMusic(parseInt(req.params.id), req.body);
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Authorize
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { isValid, newAccessToken } = await verifyToken(accessToken, refreshToken);

    if (!isValid && !newAccessToken) return res.status(401).json({ message: 'Unauthorized access' });
    if (newAccessToken) res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Delete music
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
