/**
 * @file
 * Provides api calls to vailidate a new
 */

const express = require('express')
const axios = require('axios')
const app = express()

// KEYS
const voteKey = 'vote'
const newsKey = 'news'

// Faki API Endpoints
const voteForNewsPath = `/${voteKey}/:${voteKey}/${newsKey}/:${newsKey}`
const verifyNewsPath = `/${newsKey}/:${newsKey}`

// Blockchain endpoints
const voteForNewsBlockchain = `/${voteKey}/:${voteKey}/${newsKey}/:${newsKey}`

// Blockchain calls
/**
 * Adds a vote for a news
 * 
 * @param {Boolean} vote 
 * @param {URL} toNews 
 */
function add(vote, toNews) {
    axios.post(voteForNewsBlockchain, {
        voteKey: vote,
        newsKey: toNews
    })
}

// Api calls
// Allows voting for a news by passing a vote(bool) and a news(url)
app.post(voteForNewsPath, function(req, res) {
    var vote = req.params[voteKey]
    var news = req.params[newsKey]
    axios.all([adds(vote, news)])
    .then(axios.spread(function (voteStatus) {
        console.log(voteStatus)
    }))

    res.send(`You voted ${req.params[voteKey]} for ${req.params[newsKey]}`)
})

// Allows verifying a new
app.get(verifyNewsPath, function (req, res) {
    res.send(req.params)
  })

// RUN SERVER
app.listen(3000, () => console.log('Listening on port 3000!'))