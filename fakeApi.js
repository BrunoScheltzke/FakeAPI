const express = require('express')
const app = express()

// KEYS
const voteKey = 'vote'
const newKey = 'new'

// PATHS
const voteForNewPath = `/${voteKey}/:${voteKey}/${newKey}/:${newKey}`
const verifyNewPath = `/${newKey}/:${newKey}`

// API CALLS
app.get(voteForNewPath, function(req, res) {
    res.send(`You voted ${req.params['vote']} for ${req.params['new']}`)
})

app.get(verifyNewPath, function (req, res) {
    res.send(req.params)
  })

// RUN SERVER
app.listen(3000, () => console.log('Listening on port 3000!'))