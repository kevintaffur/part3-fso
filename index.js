const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

morgan.token('data', (req, res) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
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

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  return response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const id = Math.floor(Math.random() * 1000);
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

  const nameExists = persons.find(person => person.name === name);
  if (nameExists) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = {
    name: name,
    number: number,
    id: id
  };
  persons = persons.concat(person);
  return response.json(person);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});