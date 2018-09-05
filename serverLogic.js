const blockchain = require('./blockchain')

const numVotesToBeSpam = 140
const numVotesToBeLowHigh = 50
const numVotesToBeSpecialist = 200

const percentageOfErrorToBeSpam = 90
const percentageOfErrorToBeHigh = 20
const percentageOfErrorToBeSpecialist = 10

const numVotesNecessaryToDetermineVeracity = 50

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

const veracity = {
    FALSE: 0,
    TRUE: 1,
    NEUTRAL: 2
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
            Promise.all(result.map(value => { return verify(value.news)}))
                .then(function(newsVeracities) {
                    var newsVotes = newsVeracities.map ( newsVeracity => {
                        var vote = result.find(value => { return value.news == newsVeracity.url }).vote
                        return new NewsVote(newsVeracity, vote)
                    })
                    //calculate reputation of user based on their votes on each news
                    finishPromisse(calculateReputation(user, newsVotes))
                }, function(err) {reject(err)})
        }, function(error) {reject(error)})
    })
}

function calculateVeracity(news, userVotes) {
    console.log('Calculate Veracity Of:')
    console.log(news)
    //votes will be an array of UserVote

    if (userVotes.length < numVotesNecessaryToDetermineVeracity) {
        return new NewsVeracity(news, veracity.NEUTRAL, 0, 0)
    }

    //veracity
    var trueVotePoints = userVotes.filter( value => { return value.vote == true })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var falseVotePoints = userVotes.filter( value => { return value.vote == false })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var veracity = trueVotePoints > falseVotePoints ? veracity.TRUE : veracity.FALSE

    //certainty
    var biggerPoints = trueVotePoints > falseVotePoints ? trueVotePoints : falseVotePoints
    var percentageOfPoints = biggerPoints/(trueVotePoints + falseVotePoints) * 100
    var certainty = percentageOfPoints - (100 - percentageOfPoints)

    var averageReputation = (trueVotePoints + falseVotePoints)/userVotes.length
    // NEED TO GET CLOSER REPUTATION

    return new NewsVeracity(news, veracity, certainty, averageReputation)
}

function calculateReputation(user, newsVotes) {
    console.log('Calculate Reputation Of:')
    console.log(user)
    //newsVotes will be an array of NewsVote

    var countOfVotes = newsVotes.length
    var countOfMissVotes = newsVotes.filter(value => { return value.vote != value.newsVeracity.veracity })
    var percentageOfError = countOfMissVotes/countOfVotes * 100
    var reput = reputation.NEUTRAL

    if (countOfVotes >= numVotesToBeSpecialist && percentageOfError <= percentageOfErrorToBeSpecialist) {
        reput = reputation.SPECIALIST
    }

    if (countOfVotes >= numVotesToBeSpam && percentageOfError >= percentageOfErrorToBeSpam) {
        reput = reputation.SPAM
    }

    if (countOfVotes >= numVotesToBeLowHigh) {
        if (percentageOfError <= percentageOfErrorToBeHigh) {
            reput = reputation.HIGH
        } else {
            reput = reputation.LOW
        }
    }

    return new User(user, reput)
}

exports.addVote = add
exports.verifyNews = verify