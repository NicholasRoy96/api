module.exports = async (req, res) => {
  try {
    const db = req.app.get('db')
    const { name, email, role } = req.body
    if (!name || !email || !role) {
      return res.status('400').send('You must provide information in all the fields.')
    }
    const existingUser = await db.collection('users').findOne({
      $or: [
        { name },
        { email }
      ]
    })
    if (!existingUser) {
      await db.collection('users').insertOne({ name, email, role })
      return res.status('201').send('User created')
    }
    if (existingUser.name === name && existingUser.email === email) {
      return res.status('409').send(`Both the name ${name} and the email ${email} are already taken`)
    }
    if (existingUser.name === name) {
      return res.status('409').send(`The name ${name} already exists`)
    }
    return res.status('409').send(`The email ${email} is already being used`)
  } catch (err) {
    return res.status('500').send(err)
  }
}
