import { readFile, writeFile } from 'fs/promises';
import { matchSorter } from 'match-sorter';
import sortBy from 'sort-by';

// CRUD OPERATIONS: Create, Read, Update, Delete to json-file
const music = { id: 1, title: '', artist: '', album: '', genre: '', duration: '', url: '' };

export const getMusics = async (query, orderBy) => {
  let musics = JSON.parse(await readFile('src/data/mockmusics.json', 'utf-8')) || [];
  if (query) musics = matchSorter(musics, query, { keys: ['title', 'artist', 'album', 'genre'] });
  if (orderBy) musics = musics.sort(sortBy(orderBy));
  else musics = musics.sort(sortBy('title'));

  return musics;
}

export const getMusic = async (id) => {
  const musics = await getMusics();
  return musics.find(music => music.id === id);
}

export const updateMusic = async (id, updatedMusic) => {
  const musics = await getMusics();
  const index = musics.findIndex(music => music.id === id);
  musics[index] = { ...musics[index], ...updatedMusic };
  await writeFile('src/data/mockmusics.json', JSON.stringify(musics, null, 2));
  return musics[index];
}

export const createMusic = async () => {
  const musics = await getMusics();
  const newMusic = { ...music, id: musics.length + 1 };
  musics.push(newMusic);
  await writeFile('src/data/mockmusics.json', JSON.stringify(musics, null, 2));
  return newMusic;
}

export const deleteMusic = async (id) => {
  let musics = await getMusics();
  let index = musics.findIndex(music => music.id === id);
  if (index > -1) {
    musics.splice(index, 1);
    await writeFile('src/data/mockmusics.json', JSON.stringify(musics, null, 2));
    return true;
  }
  return false;
}
