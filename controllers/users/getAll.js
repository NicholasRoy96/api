module.exports = async (req, res) => {
  try {
    const db = req.app.get('db')
    const result = await db.collection('users').find().toArray()
    if (!result.length) return res.status('204').send('No users exist')
    return res.status('200').send(result)
  } catch (err) {
    return res.status('500').send(err)
  }
}
