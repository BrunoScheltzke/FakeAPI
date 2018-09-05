/**
 * @file
 * Provides api calls to vailidate a new
 */
const express = require('express')
const server = require('./serverLogic')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// KEYS
const kVote = 'vote'
const kNews = 'news'
const kUser = 'user'

// Fake API Endpoints
const voteForNewsPath = `/${kVote}`
const verifyNewsPath = `/${kNews}/:${kNews}`

// Api calls
// Allows voting for a news by passing a vote(bool) and a news(url)
app.post(voteForNewsPath, function(req, res) {
    var vote = req.body.vote
    var news = req.body.news
    var user = req.body.user

    server.addVote(vote, news, user).then(function(result) {
        res.send(`Success!${result}`)
    }, function(error) {
        console.log(error)
        res.send(`Error!${error}`)
    })
})

// Allows verifying a new
app.get(verifyNewsPath, function (req, res) {
    server.verifyNews(req.params[kNews]).then(function(result) {
        res.send(result)
    }, function(error) {
        console.log(error)
        res.send(error)
    })
  })

// RUN SERVER
app.listen(3000, () => console.log('Listening on port 3000!'))