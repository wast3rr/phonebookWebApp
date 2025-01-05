const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
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

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    response.send(
        '<p>Phonebook has info for ' + persons.length + ' people.</p>' +
        '<p>' + new Date() + '</p>'
    )
})

const generateId = () => {
    const maxId = persons.length > 0 ? 
        Math.max(...persons.map(p => Number(p.id)))
        : 0
    
        return String(maxId + 1)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(404).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(404).json({
            error: 'number is missing'
        })
    } else if (persons.find(p => body.name === p.name)) {
        return response.status(404).json({
            error: 'name already exists in phonebook'
        })
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number || '0',
    }

    persons = persons.concat(newPerson)

    response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('Server running on port ', PORT)
})