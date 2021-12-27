const express = require('express')
const router = express.Router()

const { loginController, loginBodyPrototype } = require('../controllers/loginController')
const { register, registerBodyPrototype } = require('../controllers/registerController')
const { checkBody } = require('../filters/checkBody')

router.post('/login', checkBody('/login-body', loginBodyPrototype), loginController)
router.post('/register', checkBody('/register-body', registerBodyPrototype), register)
router.get('/auth/connect', async (_req, res) => {
    res.status(200).send({ connected: true })
})
router.get('/logout', async (_req, res) => {
    res.clearCookie('authcookie');
    res.status(204).send()
})

exports.router = router
