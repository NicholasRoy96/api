const sinon = require('sinon')
const appRoot = require('app-root-path')
const create = require(`${appRoot}/controllers/users/create`)
const { mockReq, mockRes } = require('sinon-express-mock')
const mongodb = require('mongodb').MongoClient
const app = require('express')()

describe('create user', () => {
  let client
  before(async () => {
    const connectionString = 'mongodb+srv://Nicholas_Roy:G7yKpK1uxgCnVV6B@clusterapi-bd19q.mongodb.net/tests?retryWrites=true&w=majority'
    client = await mongodb.connect(connectionString, { useUnifiedTopology: true })
    await client.db().collection('users').insertOne({ name: 'nick', email: 'nick@nick.com', role: 'test role' })
    app.set('db', client.db())
  })

  after(async () => {
    await client.db().collection('users').deleteMany({})
  })

  describe('with a general error', () => {
    const res = mockRes()
    it('calls res.status with 500 error', async () => {
      await create({}, res)
      expect(res.status).to.have.been.calledWith('500')
    })
    it('calls res.send with the error', async () => {
      await create({}, res)
      expect(res.send).to.have.been.calledWith(sinon.match.has('message', "Cannot read property 'get' of undefined"))
    })
  })

  describe('with invalid user input', () => {
    describe('with missing name', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        body: { name: '', email: 'nick@nick.com' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all the fields', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
    describe('with missing email', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        body: { name: 'nick', email: '' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all the fields', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
    describe('with missing role', () => {
      const req = mockReq({
        app: { get: sinon.stub() },
        body: { name: 'nick', email: 'nick@nick.com', role: '' }
      })
      const res = mockRes()
      it('should return with a 400 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('400')
      })
      it('should return with a string saying must provide information to all the fields', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('You must provide information in all the fields.')
      })
    })
  })

  describe('if user already exists', () => {
    describe('name and email already exists', () => {
      const req = mockReq({
        app,
        body: { name: 'nick', email: 'nick@nick.com', role: 'test role' }
      })
      const res = mockRes()
      it('should return a 409 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('409')
      })
      it('should call res.send with the name and email error', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('Both the name nick and the email nick@nick.com are already taken')
      })
    })

    describe('name but not email already exists', () => {
      const req = mockReq({
        app,
        body: { name: 'nick', email: 'duncan@duncan.com', role: 'test role' }
      })
      const res = mockRes()
      it('should return a 409 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('409')
      })
      it('should call res.send with the name error', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('The name nick already exists')
      })
    })

    describe('email but not name already exists', () => {
      const req = mockReq({
        app,
        body: { name: 'Duncan', email: 'nick@nick.com', role: 'test role' }
      })
      const res = mockRes()
      it('should return a 409 status', async () => {
        await create(req, res)
        expect(res.status).to.have.been.calledWith('409')
      })
      it('should call res.send with the email error', async () => {
        await create(req, res)
        expect(res.send).to.have.been.calledWith('The email nick@nick.com is already being used')
      })
    })
  })

  describe('if the user doesnt exist', async () => {
    const req = mockReq({
      app,
      body: { name: 'Duncan', email: 'duncan@duncan.com', role: 'test role' }
    })
    const res = mockRes()
    it('should insert user to database and return a 201 status', async () => {
      await create(req, res)
      expect(res.status).to.have.been.calledWith('201')
    })
    it('should call res.send with user created message', async () => {
      await create(req, res)
      expect(res.send).to.have.been.calledWith('User created')
    })
  })
})
