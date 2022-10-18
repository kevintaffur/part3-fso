require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

morgan.token('data', (req) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then((returnedPersons) => {
      response.json(returnedPersons);
    })
    .catch((err) => {
      next(err);
    });
});

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then((returnedPersons) => {
      const total = returnedPersons.length;
      response.send(`
        <div>Phonebook has info for ${total} ${total === 1 ? 'person' : 'people'}</div>
        <br/>
        <div>${new Date()}</div>
      `);
    })
    .catch((err) => {
      next(err);
    });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((returnedPerson) => {
      if (returnedPerson) {
        response.json(returnedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.put('/api/persons/:id', (request, response, next) => {
  const [name, number] = request.body;

  const person = {
    name,
    number,
  };

  Person
    .findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, content: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((err) => {
      next(err);
    });
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

app.post('/api/persons', (request, response, next) => {
  const [name, number] = request.body;

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((err) => {
      next(err);
    });
});

const unknownEndPoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
};

app.use(unknownEndPoint);

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'MongoServerError') {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
