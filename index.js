require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const Person = require("./models/person");

morgan.token("data", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

app.get("/info", async (request, response) => {
  const query = Person.find();
  let queryLength = await query.countDocuments();
  let date = new Date();
  response.send(
    `<h1>Phonebook:</h1><p>Contains ${queryLength} phone number(s)</p><p>${date}</p>`
  );
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const person = {
    name: body.name,
    phone: body.phone,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: body.phone }).then(
    (updatedPerson) => {
      response.json(updatedPerson);
    }
  );
});

app.post("/api/persons", async (request, response) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    phone: body.phone,
  });

  const nameExists = await Person.exists({ name: body.name });

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  } else if (!body.phone) {
    return response.status(400).json({ error: "phone missing" });
  } else {
    person.save().then((savedPerson) => {
      response.json(savedPerson);
    });
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
