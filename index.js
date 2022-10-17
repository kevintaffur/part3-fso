require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

morgan.token('data', (req, res) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(returnedPersons => {
      response.json(returnedPersons);
    });
});

app.get('/info', (request, response) => {
  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${new Date()}</div>
  `);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    return response.json(person);
  }
  return response.status(404).end();
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

app.post('/api/persons', (request, response) => {
  const name = request.body.name;
  const number = request.body.number;

  if (!name) {
    return response.status(400).json({
      error: 'name missing'
    });
  }

  if (!number) {
    return response.status(400).json({
      error: 'number missing'
    });
  }

  const person = new Person({
    name: name,
    number: number,
  });

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson);
    });
});

const unknownEndPoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
}

app.use(unknownEndPoint);

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  next(err);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});