import { matchSorter } from 'match-sorter';
import sortBy from 'sort-by';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.NODE_POSTGRES_URL });

const readMusics = async () => {
  const { rows } = await pool.query('SELECT * FROM musics');
  return rows;
}

export const getMusics = async (query, orderBy) => {
  let musics = await readMusics();
  if (query) musics = matchSorter(musics, query, { keys: ['title', 'artist', 'album', 'genre'] });
  if (orderBy) musics = musics.sort(sortBy(orderBy));
  else musics = musics.sort(sortBy('title'));
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
