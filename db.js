const mongodb = require('mongodb').MongoClient
const app = require('./server')
const dotenv = require('dotenv')
dotenv.config()

mongodb.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, client) {
  if (err) throw new Error(err)
  app.set('db', client.db())
  app.listen(process.env.PORT)
})
