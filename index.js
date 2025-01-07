const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./modules/person')

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

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(result => {
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then((count) => {
            response.send(
                '<p>Phonebook has info for ' + count + ' people.</p>' +
                '<p>' + new Date() + '</p>'
            )
        })
})

app.post('/api/persons', async (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(404).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(404).json({
            error: 'number is missing'
        })
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number || '0',
    })

    newPerson.save().then(result => {
        response.json(result)
    })
})

app.put('/api/persons/:id', (request, response) => {
    const newNumber = request.body.number

    if (!newNumber) {
        return response.status(404).json({
            error: 'number is missing'
        })
    }

    Person.findByIdAndUpdate(request.params.id, {number: newNumber}, {new: true})
        .then(updatedPerson  => {
            if (!updatedPerson) {
                return response.status(404).json({
                    error: 'person not found'
                })
            }
            response.json(updatedPerson)
        })
        .catch(error => {
            console.log(error)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(
            response.status(204).end()
        )
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('Server running on port ', PORT)
})