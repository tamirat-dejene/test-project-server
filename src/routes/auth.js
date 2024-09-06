import express from 'express';
import jwt from 'jsonwebtoken'
import { createUser, login } from '../actions.js';

const ACCESS_TOKEN = { secret: process.env.AUTH_ACCESS_TOKEN_SECRET, expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY };
const REFRESH_TOKEN = { secret: process.env.AUTH_REFRESH_TOKEN_SECRET, expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY };
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await login(email, password);
    const accessToken = jwt.sign({ email: user.email }, ACCESS_TOKEN.secret, { expiresIn: ACCESS_TOKEN.expiry });
    const refreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN.secret, { expiresIn: REFRESH_TOKEN.expiry });

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not found' });

  req.co
  jwt.verify(refreshToken, REFRESH_TOKEN.secret, (error, decoded) => {
    if (error) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ email: decoded.email }, ACCESS_TOKEN.secret, { expiresIn: ACCESS_TOKEN.expiry });
    res.header('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ message: 'Token refreshed' });
  });
});

router.post('/signup', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.status(200).json({ message: 'Logged out' });
});

export default router;