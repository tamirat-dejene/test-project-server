import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser'
import AuthRouter from './routes/auth.js';
import MusicRouter from './routes/musics.js';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });
// hello cors
const app = express();
const PORT = process.env.PORT || 9001;
const CLIENT = process.env.CLIENT || 'http://localhost:4000';

app.use(cors({
  origin: CLIENT,
  credentials: true,
  exposedHeaders: ['Authorization'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


app.get('/', (_, res) => {
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

app.use('/auth', AuthRouter);
app.use('/musics', MusicRouter);


app.listen(PORT || 9002, () => {
  console.log(`Server listening on port ${PORT}`);
});


export default app;