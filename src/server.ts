import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('No JWT_SECRET provided');
}

app.use(express.json());

app.use(cookieParser());

const users = [
  {
    username: 'phlgr',
    name: 'philipp',
    password: '1234',
    favoriteFood: 'Pizza',
  },
  {
    username: 'marf',
    name: 'marwin',
    password: '4321',
    favoriteFood: 'Burger',
  },
];

app.get('/api/users/me', (request, response) => {
  const { sessiontoken } = request.cookies;
  const username = jwt.verify(sessiontoken, JWT_SECRET);
  try {
    const user = users.find((user) => user.username === username);
    if (!user) {
      response.status(404).send('User not found');
    }
    response.send(user);
  } catch (e) {
    console.error(e);
    response.status(500).send('Something went wrong');
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (!user) {
      res.status(401).send('User not found');
      return;
    }
    const token = jwt.sign(username, JWT_SECRET);
    res.cookie('sessiontoken', token).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong');
  }
});

app.use('/storybook', express.static('dist/storybook'));

app.use(express.static('dist/app'));

app.get('*', (_request, response) => {
  response.sendFile('index.html', { root: 'dist/app' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
