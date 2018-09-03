/**
 * @file
 * Provides api calls to vailidate a new
 */
import server from './serverLogic';
import express from 'express';
const app = express()

// KEYS
const voteKey = 'vote'
const newsKey = 'news'

// Fake API Endpoints
const voteForNewsPath = `/${voteKey}/:${voteKey}/${newsKey}/:${newsKey}`
const verifyNewsPath = `/${newsKey}/:${newsKey}`

// Api calls
// Allows voting for a news by passing a vote(bool) and a news(url)
app.post(voteForNewsPath, function(req, res) {
    //var vote = req.params[voteKey]
    //var news = req.params[newsKey]
    //axios.all([adds(vote, news)])
    //.then(axios.spread(function (voteStatus) {
    //    console.log(voteStatus)
    //}))

    res.send(`You voted ${req.params[voteKey]} for ${req.params[newsKey]}`)
})

// Allows verifying a new
app.get(verifyNewsPath, function (req, res) {
    res.send(req.params)
  })

// RUN SERVER
app.listen(3000, () => console.log('Listening on port 3000!'))