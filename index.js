const express = require('express');
const morgan = require('morgan');

const app = express();

const logger = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
  ].join(' ');
});
app.use(logger);

app.use(express.json());

let phonebook = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

const generateId = () => {
  const maxId =
    phonebook.length > 0
      ? Math.max(...phonebook.map((person) => person.id))
      : 0;
  return maxId + 1;
};

app.get('/info', (request, response) => {
  const info = {
    message: `Phonebook has info for ${phonebook.length} people`,
    time: new Date(),
  };
  response.send(`<div>${info.message}<br>${info.time}</div>`);
});

app.get('/api/persons', (request, response) => {
  response.json(phonebook);
});

app.post('/api/persons', (request, response) => {
  const body = request.body;
  const checkIfNameExists = phonebook.some(
    (person) => person.name === body.name
  );
  if (!body.name) {
    return response.status(400).json({
      error: 'a name must be provided',
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'a number must be provided',
    });
  } else if (checkIfNameExists) {
    return response.status(400).json({
      error: 'this person already exists',
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };
  phonebook = phonebook.concat(person);
  response.json(person);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = phonebook.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  phonebook = phonebook.filter((person) => person.id !== id);
  response.status(204).end();
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
