const sinon = require('sinon')
const appRoot = require('app-root-path')
const getAll = require(`${appRoot}/controllers/users/getAll`)
const { mockReq, mockRes } = require('sinon-express-mock')
const mongodb = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const app = require('express')()

describe('get all users', () => {
  let client
  before(async () => {
    const connectionString = 'mongodb+srv://Nicholas_Roy:G7yKpK1uxgCnVV6B@clusterapi-bd19q.mongodb.net/tests?retryWrites=true&w=majority'
    client = await mongodb.connect(connectionString, { useUnifiedTopology: true })
    await client.db().collection('users').insertMany(
      [
        { _id: ObjectID('5dd869a30790d7085ca8f376'), name: 'nick', email: 'nick@nick.com', role: 'test role' },
        { _id: ObjectID('5dd869a30790d7085ca8f377'), name: 'duncan', email: 'duncan@duncan.com', role: 'test role' }
      ]
    )
    app.set('db', client.db())
  })

  describe('with a general error', () => {
    const res = mockRes()
    it('calls res.status with 500 error', async () => {
      await getAll({}, res)
      expect(res.status).to.have.been.calledWith('500')
    })
    it('calls res.send with the error', async () => {
      await getAll({}, res)
      expect(res.send).to.have.been.calledWith(sinon.match.has('message', "Cannot read property 'get' of undefined"))
    })
  })

  describe('if users exist', async () => {
    const req = mockReq({
      app
    })
    const res = mockRes()
    it('should return with a 200 status and success message', async () => {
      await getAll(req, res)
      expect(res.status).to.have.been.calledWith('200')
    })
    it('should return all documents from the database', async () => {
      await getAll(req, res)
      expect(res.send).to.have.been.calledWith([{
        _id: ObjectID('5dd869a30790d7085ca8f376'),
        name: 'nick',
        email: 'nick@nick.com',
        role: 'test role'
      },
      {
        _id: ObjectID('5dd869a30790d7085ca8f377'),
        name: 'duncan',
        email: 'duncan@duncan.com',
        role: 'test role'
      }
      ])
    })
  })

  describe('if no users exist', () => {
    before(async () => {
      await client.db().collection('users').deleteMany({})
    })
    const req = mockReq({
      app
    })
    const res = mockRes()
    it('should return with a 204 status', async () => {
      await getAll(req, res)
      expect(res.status).to.have.been.calledWith('204')
    })
    it('should return a string saying no users exist', async () => {
      await getAll(req, res)
      expect(res.send).to.have.been.calledWith('No users exist')
    })
  })
})
