const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
morgan.token('content', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return null
  }
})

app.use(morgan(':method :url: status :res[content-length] - :response-time ms :content'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).send({ error: 'id not found' })
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      response.send(
        '<p>Phonebook has info for ' + count + ' people.</p>' +
                '<p>' + new Date() + '</p>'
      )
    })
})

app.post('/api/persons', async (request, response, next) => {
  const body = request.body

  const newPerson = new Person({
    name: body.name,
    number: body.number || '0',
  })

  newPerson.save()
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const newNumber = request.body.number

  Person.findByIdAndUpdate(request.params.id, { number: newNumber }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson  => {
      if (!updatedPerson) {
        return response.status(404).json({
          error: 'person not found'
        })
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(
      response.status(204).end()
    )
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('Server running on port ', PORT)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)