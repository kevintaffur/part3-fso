const mongoose = require('mongoose');

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://kevin:${password}@cluster0.7mnvd1t.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  console.log('phonebook:');
  mongoose
    .connect(url)
    .then(() => {
      Person
        .find({})
        .then((persons) => {
          persons.forEach((person) => {
            console.log(`${person.name} ${person.number}`);
          });
          return mongoose.connection.close();
        });
    });
}

mongoose
  .connect(url)
  .then(() => {
    const person = new Person({
      name,
      number,
    });

    return person.save();
  })
  .then(() => {
    console.log(`added ${name} number ${number} to the phonebook`);
    return mongoose.connection.close();
  })
  .catch((error) => console.log(error));
