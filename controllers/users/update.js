const mongodb = require('mongodb')

module.exports = async (req, res) => {
  try {
    const db = req.app.get('db')
    const { name, email, role } = req.body
    if (!name || !email || !role) {
      return res.status('400').send('You must provide information in all the fields.')
    }
    const result = await db.collection('users').findOneAndReplace({ _id: mongodb.ObjectID(req.params.id) }, { name, email, role })
    if (!result.value) return res.status('204').send('User not found')
    return res.status('201').send(`User's name and email were successfully changed to ${name} and ${email}, and the job role was set as ${role}`)
  } catch (err) {
    return res.status('500').send(err)
  }
}
