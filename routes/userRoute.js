const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// Create user
router.post('/createUser', userController.createUser)

// Get user(s) information
router.get('/getUser/:id', userController.getUser)
router.get('/getAllUsers', userController.getAllUsers)

// Update user
router.put('/updateUser/:id', userController.updateUser)

// Delete user
router.delete('/deleteUser/:id', userController.deleteUser)

module.exports = router
