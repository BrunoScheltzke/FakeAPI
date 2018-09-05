const blockchain = require('./blockchain')

const numVotesToBeSpam = 140
const numVotesToBeLowHigh = 50
const numVotesToBeSpecialist = 200

const percentageOfErrorToBeSpam = 90
const percentageOfErrorToBeLow = 80
const percentageOfErrorToBeHigh = 20
const percentageOfErrorToBeSpecialist = 10

class User {
    constructor(id, reputation) {
        this.id = id
        this.reputation = reputation
    }
}

class NewsVeracity {
    constructor(url, veracity, certainty, relevance) {
        this.url = url
        this.veracity = veracity
        this.certainty = certainty
        this.relevance = relevance
    }
}

function add(vote, toNews, byUser) {
    return new Promise(function(resolve, reject) {
        blockchain.addVote(vote, toNews, byUser).then(function(result) {
            console.log(`Added vote ${result}`)
            resolve(result)
        }, function(error) {
            reject(error)
        })
    })
}

function verify(newsURL) {
    return new Promise(function(finishPromisse, reject) {
        //get all votes of news
        blockchain.getAllVotesToNews(newsURL).then(function(result) {
            //this result is an array of blocks(Block class) from the blockchain
            //get reputation of each user that voted
            Promise.all(result.map(value => { return calculateReputationOf(value.user)}))
                .then(function(users) {
                    //calculate veracity based on users reputatation
                    var userVotes = users.map ( user => {
                        var vote = result.find(value => { return value.user == user.id }).vote
                        return new UserVote(user, vote)
                    })
                    finishPromisse(calculateVeracity(newsURL, userVotes))
                }, function(err) { 
                    console.log(err)
                    reject(err) 
                })
        }, function(error) { 
            console.log(error)
            reject(error) 
        })
    })
}

function calculateReputationOf(user) {
    return new Promise(function(finishPromisse, reject) {
        //get all votes made by user
        blockchain.getAllVotesBy(user).then(function(result) {
            //this result is an array of blocks(Block class) from the blockchain
            //get veracity of each news voted by user
            Promise.all(result.map(value => { return check(value.news, user)}))
                .then(function(newsVeracities) {
                    var newsVotes = newsVeracities.map ( newsVeracity => {
                        var vote = result.find(value => { return value.news == newsVeracity.url }).vote
                        return new NewsVote(newsVeracity, vote)
                    })
                    //calculate reputation of user based on their votes on each new
                    finishPromisse(calculateReputation(user, newsVotes))
                }, function(err) {reject(err)})
        }, function(error) {reject(error)})
    })
}

function check(newsURL, excludingUser) {
    return new Promise(function(finishPromisse, reject) {
        //get all votes of news
        blockchain.getAllVotesToNews(newsURL).then(function(result) {
            //this result is an array of blocks(Block class) from the blockchain
            //get reputation of each user that voted excluding the current user being calculated
            Promise.all(result.filter(value => { return value.user != excludingUser }).map(value => { return calculateReputationOf(value.user)}))
                .then(function(users) {
                    //calculate veracity based on users reputatation
                    var userVotes = users.map ( user => {
                        var vote = result.find(value => {value.user == user}).vote
                        return new UserVote(user, vote)
                    })
                    finishPromisse(calculateVeracity(newsURL, userVotes))
                }, function(err) { reject(err) })
        }, function(error) { reject(error) })
    })
}

function calculateVeracity(news, userVotes) {
    console.log('Calculate Veracity Of:')
    console.log(news)
    console.log(userVotes)
    //votes will be an array of UserVote
    return new NewsVeracity(news, true, 0, 0)
}

function calculateReputation(user, newsVotes) {
    console.log('Calculate Reputation Of:')
    console.log(user)
    console.log(newsVotes)
    //newsVotes will be an array of NewsVote
    return new User(user, reputation.NEUTRAL)
}

exports.addVote = add
exports.verifyNews = verify

class UserVote {
    constructor(user, vote) {
        this.user = user
        this.vote = vote
    }
}

class NewsVote {
    constructor(newsVeracity, vote) {
        this.newsVeracity = newsVeracity
        this.vote = vote
    }
}

const reputation = {
    SPAM: 0,
    LOW: 1,
    NEUTRAL: 3,
    HIGH: 50,
    SPECIALIST: 150
}