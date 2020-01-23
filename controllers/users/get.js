const mongodb = require('mongodb')

module.exports = async (req, res) => {
  try {
    const db = req.app.get('db')
    const result = await db.collection('users').findOne({ _id: mongodb.ObjectID(req.params.id) })
    if (!result) return res.status('204').send('User not found')
    return res.status('200').send(result)
  } catch (err) {
    return res.status('500').send(err)
  }
}
