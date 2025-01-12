const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI
console.log(url)

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(result => {
    console.log('connected to mongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function customValidator(value) {
        // Regex: ^\d{2,3}-\d+$
        const regex = /^\d{2,3}-\d+$/
        return regex.test(value)
      },
      message: props => props.value + ' is not a valid format'
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)