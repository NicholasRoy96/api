const sinon = require('sinon')
const appRoot = require('app-root-path')
const update = require(`${appRoot}/controllers/users/update`)
const { mockReq, mockRes } = require('sinon-express-mock')
const mongodb = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const app = require('express')()

describe('update a user', () => {
  let client
  before(async () => {
    const connectionString = 'mongodb+srv://Nicholas_Roy:G7yKpK1uxgCnVV6B@clusterapi-bd19q.mongodb.net/tests?retryWrites=true&w=majority'
    client = await mongodb.connect(connectionString, { useUnifiedTopology: true })
    await client.db().collection('users').insertOne(
      { _id: ObjectID('5dd869a30790d7085ca8f376'), name: 'nick', email: 'nick@nick.com', role: 'test role' }
    )
    app.set('db', client.db())
  })

  after(async () => {
    await client.db().collection('users').deleteMany({})
  })

  describe('with a general error', () => {
    const res = mockRes()
    it('calls res.status with 500 error', async () => {
      await update({}, res)
      expect(res.status).to.have.been.calledWith('500')
    })
    it('calls res.send with the error', async () => {
      await update({}, res)
      expect(res.send).to.have.been.calledWith(sinon.match.has('message', "Cannot read property 'get' of undefined"))
    })
  })

  describe('with invalid user input', () => {
    describe('with missing name', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        params: { id: '5dd869a30790d7085ca8f376' },
        body: { name: '', email: 'nick@nick.com', role: 'test role' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await update(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all fields', async () => {
        await update(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
    describe('with missing email', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        params: { id: '5dd869a30790d7085ca8f376' },
        body: { name: 'nick', email: '', role: 'test role' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await update(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all fields', async () => {
        await update(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
    describe('with missing role', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        params: { id: '5dd869a30790d7085ca8f376' },
        body: { name: 'nick', email: 'nick@nick.com', role: '' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await update(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all fields', async () => {
        await update(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
  })

  describe('if user does not exist', async () => {
    const req = mockReq({
      app,
      params: { id: '507f1f77bcf86cd710439011' },
      body: { name: 'bill', email: 'bill@bill.com', role: 'test role' }
    })
    const res = mockRes()
    it('should return with a 204 status', async () => {
      await update(req, res)
      expect(res.status).to.have.been.calledWith('204')
    })
    it('should return a message of user not found', async () => {
      await update(req, res)
      expect(res.send).to.have.been.calledWith('User not found')
    })
  })

  describe('if user does exist and user input is complete', async () => {
    const req = mockReq({
      app,
      params: { id: '5dd869a30790d7085ca8f376' },
      body: { name: 'nicholas', email: 'nicholas@nicholas.com', role: 'updated test role' }
    })
    const res = mockRes()
    describe('should update the specified user', () => {
      it('should return a 201 status', async () => {
        await update(req, res)
        expect(res.status).to.have.been.calledWith('201')
      })
      it('should return a user updated message', async () => {
        await update(req, res)
        expect(res.send).to.have.been.calledWith("User's name and email were successfully changed to nicholas and nicholas@nicholas.com, and the job role was set as updated test role")
      })
    })
  })
})
