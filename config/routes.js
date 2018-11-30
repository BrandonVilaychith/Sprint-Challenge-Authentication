const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig.js');
const jwtKey = require('../_secrets/keys.js').jwtKey;
const jwt = require('jsonwebtoken');

const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const generateToken = user => {
  const payload = {
    username: user.username,
    subject: user.id
  };

  const secret = jwtKey;

  const options = {
    expiresIn: '5m'
  };

  return jwt.sign(payload, secret, options);
};

function register(req, res) {
  // implement user registration

  // Grabs credentials from request
  const credentials = req.body;

  // Hash the password in the request
  const hash = bcrypt.hashSync(credentials.password, 10);

  // Change password
  credentials.password = hash;

  // Add to database
  db('users')
    .insert(credentials)
    .then(id => {
      res.status(201).json({ message: 'User successfully added', id });
    })
    .catch(error =>
      res.status(500).json({ message: 'Error adding user', error })
    );
}

function login(req, res) {
  // implement user login
  // Get the credentials from request
  const credentials = req.body;

  // Log in user
  db('users')
    .where({ username: credentials.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(credentials.password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: 'Successful login', token });
      } else {
        res.status(401).json({ message: 'Could not find user' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Error logging in', error });
    });
}

function getJokes(req, res) {
  axios
    .get(
      // 'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
      'https://safe-falls-22549.herokuapp.com/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
