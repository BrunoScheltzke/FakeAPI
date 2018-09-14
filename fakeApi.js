/**
 * @file
 * Provides api calls to vailidate a new
 */
const express = require('express')
const server = require('./serverLogic')
const app = express()
const blockchain = require('./blockchain')
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// KEYS
const kVote = 'vote'
const kNews = 'newsURL'
const kPublicKey = 'userPublicKey'
const kAesKey = 'aesKey'
const kCreateBlock = 'createBlock'

// Fake API Endpoints
const voteForNewsPath = `/${kVote}`
const verifyNewsPath = `/${kNews}/:${kNews}`
const createBlockPath = `/${kCreateBlock}`

// Api calls
// Allows voting for a news by passing a vote(bool) and a news(url)
app.post(voteForNewsPath, function(req, res) {
    var vote = req.body.vote
    var newsURL = req.body.newsURL
    var pubKey = req.body.userPublicKey
    var aesKey = req.body.aesKey

    server.addVote(vote, newsURL, pubKey).then(function(result) {
        res.send(result)
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

// Allows adding a new block
app.post(createBlockPath, function(req, res) {
    console.log("Received a block creation request")
    const pubKey = req.body.userPublicKey
    blockchain.createBlock(pubKey).then(function(result) {
        res.send(result)
    }).catch(function(error) {
        console.log(error)
        res.send(error)
    })
})

// RUN SERVER
app.listen(3000, () => console.log('Listening on port 3000!'))