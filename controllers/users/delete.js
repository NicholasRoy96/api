const mongodb = require('mongodb')

module.exports = async (req, res) => {
  try {
    const db = req.app.get('db')
    const result = await db.collection('users').deleteOne({ _id: mongodb.ObjectID(req.params.id.toString()) })
    if (!result.deletedCount) {
      return res.status('204').send('Could not delete the user. Are you sure this user exists?')
    }
    return res.status('200').send('User successfully deleted')
  } catch (err) {
    return res.status('500').send(err)
  }
}
