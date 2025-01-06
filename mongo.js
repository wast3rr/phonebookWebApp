const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Must enter passowrd')
    process.exit(1)
}

const password = process.argv[2]

const url = 
    'mongodb+srv://midasg91:' + password + '@phonebook.rbida.mongodb.net/phonebookEntries?retryWrites=true&w=majority&appName=phonebook'

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const newPerson = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    newPerson.save().then(result => {
        console.log('added ', result.name, ' number ', result.number, ' to phonebook')
        mongoose.connection.close()
    })
} else if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('phonebook')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
} else {
    console.log('Inappropriate amount of arguments')
    process.exit(1)
}