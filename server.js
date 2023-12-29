const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')
const { isInvalidEmail, isEmptyPayload } = require('./validator')

const { DB_USER, DB_PASS, DEV } = process.env

const url = DEV ? 'mongodb://127.0.0.1:27017' : `mongodb://${DB_USER}:${DB_PASS}@127.0.0.1:27017?authSource=company_db`

const client = new MongoClient(url)
const dbName = 'company_db'
const collName = 'employees'

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/dist'))

app.get('/get-profile', async function(req, res) {

    await client.connect()
    console.log('Connected successfully to database server')

    const db = client.db(dbName)
    const collection = db.collection(collName)

    const result = await collection.findOne({id: 1})
    console.log(result)
    client.close()

    response = {}

    if (result !== null) {
        response = {
          name: result.name,
          email: result.email,
          interests: result.interests
        }
    }

    res.send(response)
})

app.post('/update-profile', async function(req, res) {
    const payload = req.body
    console.log(payload)

    if (isEmptyPayload(payload) || isInvalidEmail(payload)) {
        res.send({error: "invalid payload. Couldn't update user profile data"})
    } else {

      await client.connect()
      console.log('Connected successfully to database server')

      const db = client.db(dbName)
      const collection = db.collection(collName)

      payload['id'] = 1;
      const updateValues = { $set: payload}
      await collection.updateOne({id: 1}, updateValues, {upsert: true})
      client.close()
          // updating user profile
      res.send({info: "user profile data updated successfully"})
      }

})

const server = app.listen(3000, function () {
  console.log("app listening on port 3000")
})
module.exports = {
  app,
  server
}
