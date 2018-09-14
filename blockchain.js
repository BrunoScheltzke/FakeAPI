const got = require('got');
const FormData = require('form-data');
const isMock = true

exports.addVote = function add(vote, toNewsURL, byUserPublicKey) {
    return isMock ? mockSaveVote(vote, toNewsURL, byUserPublicKey) : blockchainVote(vote, toNewsURL, byUserPublicKey)
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

// Blockchain funtions
const votesKey = 'votes'
const voteKey = 'vote'
const newsURLKey = 'newsURL'
const publicKeyKey = 'userPublicKey'
const createBlockKey = 'createBlock'
const blockKey = 'block'
const basePath = 'http://localhost:5000'
const votePath = `${basePath}/vote`
const votesByUserPath = `${basePath}/votesBy/`
const votesToNewsPath = `${basePath}/votesTo/`
const createBlockPath = `${basePath}/${createBlockKey}`

function blockchainVote(vote, newsURL, byUserPublicKey) {
    const form = new FormData()
    form.append(voteKey, vote)
    form.append(publicKeyKey, byUserPublicKey)
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

function blockchainGetAllVotesBy(userPublicKey) {
    return new Promise(function(finishPromise, reject) {
        got(votesByUserPath + userPublicKey)
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
    console.log("Got to blockchain module")
    console.log(userPublicKey)
    const form = new FormData()
    form.append(publicKeyKey, userPublicKey)
    
    return new Promise(function(finishPromise, reject) {
        got.post(createBlockPath, {
            body: form
        }).then(function(response) {
            console.log(response)
            finishPromise(JSON.parse(response.body))
        }).catch(function(error) {
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

function mockSaveVote(someVote, someNews, userPublicKey) {
    return new Promise(function(resolve, _reject) {
        var newBlock = {"vote": someVote, "newsURL": someNews, "userPublicKey": userPublicKey, "date": new Date()}
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