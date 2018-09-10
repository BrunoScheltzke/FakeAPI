const got = require('got');
const FormData = require('form-data');
const isMock = true

exports.addVote = function add(vote, toNews, byUser) {
    return isMock ? mockSaveVote(vote, toNews, byUser) : blockchainVote(vote, toNews, byUser)
}

exports.getAllVotesToNews = function getAllVotesTo(news) {
    return isMock ? mockGetAllVotesTo(news) : blockchainGetAllVotesToNews(news)
}

exports.getAllVotesBy = function getAllVotesBy(user) {
    return isMock ? mockGetAllVotesBy(user) : blockchainGetAllVotesBy(user)
}


// Blockchain funtions
const votesKey = 'votes'
const voteKey = 'vote'
const userIdKey = 'userId'
const newsURLKey = 'newsURL'
const blockKey = 'block'
const basePath = 'http://192.168.25.9:5000'
const votePath = `${basePath}/vote`
const votesByUserPath = `${basePath}/votesBy/`
const votesToNewsPath = `${basePath}/votesTo/`

function blockchainVote(vote, newsURL, userId) {
    const form = new FormData()
    form.append(voteKey, vote)
    form.append(userIdKey, userId)
    form.append(newsURLKey, newsURL)

    return new Promise(function(finishPromise, reject) {
        got.post(votePath, {
            body: form
        }).then(function(response) {
            finishPromise(JSON.parse(response.body))
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainGetAllVotesToNews(newsURL) {
    return new Promise(function(finishPromise, reject) {
        got(votesToNewsPath + newsURL)
        .then(function(response) {
            const result = JSON.parse(response.body).map(value => {return new Block(value.vote, value.newsURL, value.userId, value.date)})
            finishPromise(result)
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainGetAllVotesBy(userId) {
    return new Promise(function(finishPromise, reject) {
        got(votesByUserPath + userId)
        .then(function(response) {
            finishPromise(JSON.parse(response.body))
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

// MOCK functions
class Block {
    constructor(vote, newsURL, userId, date) {
        this.vote = vote
        this.newsURL = newsURL
        this.userId = userId
        this.date = date
    }
}

var mockVotesBlock = []

function mockSaveVote(someVote, someNews, someUser) {
    return new Promise(function(resolve, _reject) {
        var newBlock = {"vote": someVote, "newsURL": someNews, "userId": someUser, "date": new Date()}
        mockVotesBlock.push(newBlock)
        console.log('Added vote')
        console.log(newBlock)
        resolve(newBlock)
    })
}

function mockGetAllVotesTo(news) {
    return new Promise(function(resolve, _reject) {
        const result = mockVotesBlock.filter(value => { return value.news == news }).sort(function(a, b) {
            // convert date object into number to resolve issue in typescript
            return  +new Date(a.date) - +new Date(b.date);
          })

        resolve(result)
    })
}

function mockGetAllVotesBy(user) {
    return new Promise(function(resolve, _reject) {
        resolve(mockVotesBlock.filter(value => { return value.user === user}).sort(function(a, b) {
            // convert date object into number to resolve issue in typescript
            return  +new Date(a.date) - +new Date(b.date);
          }))
    })
}