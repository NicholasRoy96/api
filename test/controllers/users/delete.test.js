const sinon = require('sinon')
const appRoot = require('app-root-path')
const deleteUser = require(`${appRoot}/controllers/users/delete`)
const { mockReq, mockRes } = require('sinon-express-mock')
const mongodb = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const app = require('express')()

describe('delete user', () => {
  let client
  before(async () => {
    const connectionString = 'mongodb+srv://Nicholas_Roy:G7yKpK1uxgCnVV6B@clusterapi-bd19q.mongodb.net/tests?retryWrites=true&w=majority'
    client = await mongodb.connect(connectionString, { useUnifiedTopology: true })
    await client.db().collection('users').insertOne({ _id: ObjectID('507f1f77bcf86cd799439011'), name: 'nick', email: 'nick@nick.com', role: 'test role' })
    app.set('db', client.db())
  })

  describe('with a general error', () => {
    const res = mockRes()
    it('calls res.status with 500 error', async () => {
      await deleteUser({}, res)
      expect(res.status).to.have.been.calledWith('500')
    })
    it('calls res.send with the error', async () => {
      await deleteUser({}, res)
      expect(res.send).to.have.been.calledWith(sinon.match.has('message', "Cannot read property 'get' of undefined"))
    })
  })

  describe('if user does not exist', () => {
    const req = mockReq({
      app,
      params: { id: '507f1f77bcf86cd710439011' }
    })
    const res = mockRes()
    it('should return with a 204 status', async () => {
      await deleteUser(req, res)
      expect(res.status).to.have.been.calledWith('204')
    })
    it('should return a string saying user not deleted', async () => {
      await deleteUser(req, res)
      expect(res.send).to.have.been.calledWith('Could not delete the user. Are you sure this user exists?')
    })
  })

  describe('if user does exist', () => {
    const req = mockReq({
      app,
      params: { id: '507f1f77bcf86cd799439011' }
    })
    const res = mockRes()
    it('should return with a 200 status and success message', async () => {
      await deleteUser(req, res)
      expect(res.status).to.have.been.calledWith('200')
      expect(res.send).to.have.been.calledWith('User successfully deleted')
    })
  })
})
