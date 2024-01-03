const express = require("express");
const morgan = require("morgan");
const app = express();

morgan.token("data", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const info = `Phonebook has info for ${persons.length} persons`;
const date = new Date();

app.get("/info", (request, response) => {
  response.send(`<p>${info}</p><p>${date}</p>`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(202).end();
});

const generateId = () => {
  return Math.round(Math.random(1000000) * 1000000);
};

const checkIfValueExists = (value) => {
  if (Object.values(persons).filter((v) => v.name === value).length === 0) {
    return false;
  }
  return true;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  } else if (!body.phone) {
    return response.status(400).json({ error: "phone missing" });
  } else if (checkIfValueExists(body.name)) {
    return response.status(400).json({ error: "name already in phonebook" });
  }

  const person = {
    name: body.name,
    number: body.phone,
    id: generateId(),
  };

  persons = persons.concat(person);
  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
