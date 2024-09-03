import pg from 'pg';
import dotenv from 'dotenv';
import sortBy from 'sort-by';
import { createHash, timingSafeEqual } from 'crypto';
import { matchSorter } from 'match-sorter';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.NODE_POSTGRES_URL });

const readMusics = async () => {
  const { rows } = await pool.query('SELECT * FROM musics');
  return rows;
}

export const getUser = async (email) => {
  const { rows } = await pool.query('SELECT * FROM music_api_users WHERE email=$1', [email]);
  return rows[0];
}

export const login = async (email, password) => {
  const user = await getUser(email);
  if (!user) throw new Error('User not found');
  
  const hashedPassword = createHash('SHA256').update(password, 'utf8').digest('base64');

  const isValid = timingSafeEqual(Buffer.from(hashedPassword), Buffer.from(user.password));
  if (!isValid) throw new Error('Invalid password');
  return {...user, password: '******'};
}

export const createUser = async (newUser) => {
  const { username, email, password } = newUser;
  const userAlreadyExists = await getUser(email);
  if (userAlreadyExists) throw new Error('User already exists');
  
  const hashedPassword = createHash('SHA256').update(password, 'utf8').digest('base64');

  try {
    const client = await pool.connect();
    await client.query('INSERT INTO music_api_users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]);
    client.release();

    const user = await getUser(email);
    return { ...user, password: '******'}
  } catch (error) {
    throw error;
  }
}

export const getMusics = async (query, orderBy) => {
  let musics = await readMusics();
  if (query) musics = matchSorter(musics, query, { keys: ['title', 'artist', 'album', 'genre', 'duration'] });
  if (orderBy) {
    if (orderBy === 'a-z') musics = musics.sort(sortBy('title'));
    else if (orderBy === 'z-a') musics = musics.sort(sortBy('-title'));
    else if (orderBy === 'artist') musics = musics.sort(sortBy('artist'));
    else if (orderBy === 'duration') musics = musics.sort(sortBy('duration'));
    else if (orderBy === 'genre') musics = musics.sort(sortBy('genre'));
    else if (orderBy === 'album') musics = musics.sort(sortBy('album'));
    else if (orderBy === 'id')
      musics = musics.sort(sortBy(orderBy))
  } else musics = musics.sort(sortBy('title'));
  return musics;
}

export const getMusic = async (id) => {
  const { rows } = await pool.query('SELECT * FROM musics WHERE id=$1', [id]);
  return rows[0];
}

export const updateMusic = async (id, updatedMusic) => {
  const client = await pool.connect();
  const { title, artist, album, genre, duration, url } = updatedMusic;
  await client.query('UPDATE musics SET title=$1, artist=$2, album=$3, genre=$4, duration=$5, url=$6 WHERE id=$7',
    [title, artist, album, genre, duration, url, id]);
  client.release();
  return { id, ...updatedMusic };
}

export const createMusic = async (newMusic) => {
  const client = await pool.connect();
  const { title, artist, album, genre, duration, url } = newMusic;
  await client.query('INSERT INTO musics (title, artist, album, genre, duration, url) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, artist, album, genre, duration, url]);

  const { rows } = await client.query('SELECT id FROM musics WHERE title=$1 AND artist=$2 AND album=$3 AND genre=$4 AND duration=$5 AND url=$6',
    [title, artist, album, genre, duration, url]);
  newMusic = { id: rows[0].id, ...newMusic };
  client.release();
  return newMusic;
}

export const deleteMusic = async (id) => {
  let musics = await getMusics();
  let index = musics.findIndex(music => music.id === id);
  if (index > -1) {
    const client = await pool.connect();
    await client.query('DELETE FROM musics WHERE id=$1', [id]);
    return true;
  }
  return false;
}