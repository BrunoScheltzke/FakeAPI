const got = require('got');
const FormData = require('form-data');
const isMock = false

exports.addVote = function add(encryptedVote, byUserPublicKey) {
    return isMock ? mockSaveVote(encryptedVote, byUserPublicKey) : blockchainVote(encryptedVote, byUserPublicKey)
}

exports.getAllVotesToNews = function getAllVotesTo(newsURL) {
    return isMock ? mockGetAllVotesTo(newsURL) : blockchainGetAllVotesToNews(newsURL)
}

exports.getAllVotesBy = function getAllVotesBy(userPublicKey) {
    return isMock ? mockGetAllVotesBy(userPublicKey) : blockchainGetAllVotesBy(userPublicKey)
}

exports.createBlock = function createBlock(userPublicKey) {
    return isMock ? mockCreateBlock(userPublicKey) : blockchainCreateBlock(userPublicKey)
}

exports.trendingNews = function trendingNews(quantity) {
    return blockchainTrendingNews(quantity)
}

exports.getAllVotes = function getAllVotes() {
    return blockchainGetAllVotes()
}

// Blockchain funtions
const votesKey = 'votes'
const encryptedVoteKey = 'encryptedVote'
const voteKey = 'vote'
const newsURLKey = 'newsURL'
const publicKeyKey = 'userPublicKey'
const createBlockKey = 'createBlock'
const blockKey = 'block'
const basePath = 'http://localhost:5000'
const votePath = `${basePath}/vote`
const votesByUserPath = `${basePath}/votesBy?userPublicKey=`
const votesToNewsPath = `${basePath}/votesTo/`
const createBlockPath = `${basePath}/${createBlockKey}`
const allVotesPath = `${basePath}/allVotes`
const trendingNewsPath = `${basePath}/popularNews/`

function blockchainTrendingNews(quantity) {
    console.log("Will get trending news")
    return new Promise(function(finishPromise, reject) {
        got(trendingNewsPath + quantity)
        .then(function(response) {
            finishPromise(response.body)
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainVote(encryptedVote, userPublicKey) {
    const form = new FormData()
    form.append(encryptedVoteKey, encryptedVote)
    form.append(publicKeyKey, userPublicKey)

    return new Promise(function(finishPromise, reject) {
        console.log("Will attempt to vote")
        got.post(votePath, {
            body: form
        }).then(function(response) {
            console.log("Success adding vote")
            finishPromise(response.body)
        })
        .catch(function(error) {
            console.log("Error adding vote")
            reject(error)
        })
    })
}

function blockchainGetAllVotesToNews(newsURL) {
    console.log("Will get all votes to news")
    return new Promise(function(finishPromise, reject) {
        got(votesToNewsPath + newsURL)
        .then(function(response) {
            const result = JSON.parse(response.body).map(value => {return new Block(value.vote, value.newsURL, value.userPublicKey, value.date)})
            finishPromise(result)
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainGetAllVotesBy(userPublicKey) {
    console.log("Will get all votes by user")
    return new Promise(function(finishPromise, reject) {
        const encodedPubKey = encodeURIComponent(userPublicKey)
        got(votesByUserPath + encodedPubKey)
        .then(function(response) {
            finishPromise(JSON.parse(response.body))
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainCreateBlock(userPublicKey) {
    console.log("Got to creation of user")
    console.log(userPublicKey)
    const form = new FormData()
    form.append(publicKeyKey, userPublicKey)
    
    return new Promise(function(finishPromise, reject) {
        got.post(createBlockPath, {
            body: form
        }).then(function(response) {
            console.log("Got response from block creation")
            console.log(JSON.parse(response.body))
            finishPromise(JSON.parse(response.body))
        }).catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

function blockchainGetAllVotes() {
    console.log("Will get all votes from chain")
    return new Promise(function(finishPromise, reject) {
        got(allVotesPath)
        .then(function(response) {
            const result = JSON.parse(response.body).map(value => {return new Block(value.vote, value.newsURL, value.userPublicKey, value.date)})
            finishPromise(result)
        })
        .catch(function(error) {
            console.log(error)
            reject(error)
        })
    })
}

// MOCK functions
class Block {
    constructor(vote, newsURL, userPublicKey, date) {
        this.vote = vote
        this.newsURL = newsURL
        this.userPublicKey = userPublicKey
        this.date = date
    }
}

var mockVotesBlock = []

function mockSaveVote(encryptedVote, userPublicKey) {
    return new Promise(function(resolve, _reject) {
        var newBlock = {"vote": true, "newsURL": "news1", "userPublicKey": userPublicKey, "date": new Date()}
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

function mockGetAllVotesBy(userPublicKey) {
    return new Promise(function(resolve, _reject) {
        resolve(mockVotesBlock.filter(value => { return value.userPublicKey === userPublicKey}).sort(function(a, b) {
            // convert date object into number to resolve issue in typescript
            return  +new Date(a.date) - +new Date(b.date);
          }))
    })
}

function mockCreateBlock(userPublicKey) {}