require('dotenv-flow').config({
  silent: true
})

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 3000

// GET /servers/<uid> -> 200 | 404 | 5XX
app.get('/servers/:serverID', (req, res) => {
  const { serverID } = req.params
  res.json({
    action: 'confirm server existance',
    serverID
  })
})
// GET /servers/<uid>/users 200 | 403 | 404
app.get('/servers/:serverID/users', (req, res) => {
  const { serverID } = req.params
  res.json({
    action: 'list users',
    serverID
  })
})
// GET /servers/<uid>/users/<uid> 200 | 403 | 404
app.get('/servers/:serverID/users/:userID', (req, res) => {
  const { serverID, userID } = req.params
  res.json({
    action: 'confirm user existance',
    serverID,
    userID
  })
})
// POST /servers/<uid>/users/<uid>/mute 200 | 403 | 404
app.post('/servers/:serverID/users/:userID/:command', (req, res) => {
  const { serverID, userID, command } = req.params
  const validCommands = ['mute', 'unmute', 'deafen', 'undeafen']
  res.json({
    serverID,
    userID,
    command: validCommands.includes(command) && command
  })
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
