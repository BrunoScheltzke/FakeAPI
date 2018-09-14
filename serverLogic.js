const blockchain = require('./blockchain')

const numVotesToBeSpam = 140
const numVotesToBeLowHigh = 50
const numVotesToBeSpecialist = 200

const percentageOfErrorToBeSpam = 90
const percentageOfErrorToBeHigh = 20
const percentageOfErrorToBeSpecialist = 10

const numVotesNecessaryToDetermineVeracity = 50

class User {
    constructor(userPublicKey, reputation) {
        this.userPublicKey = userPublicKey
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

class Process {
    constructor(id) {
        this.id = id
        this.news = []
        this.users = []
        this.verifiedNews = []
        this.verifiedUsers = []
    }
}

var processes = []

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

function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

function add(encryptedVote, userPublicKey) {
    return new Promise(function(resolve, reject) {
        blockchain.addVote(encryptedVote, userPublicKey).then(function(result) {
            resolve(result)
        }, function(error) {
            reject(error)
        })
    })
}

function verify(newsURL, processId) {
    const index = processes.findIndex(value => { return value.id == processId })

    const verifiedNews = processes[index].verifiedNews.find(value => {return value.url == newsURL})
    if (verifiedNews != null) {
        return new Promise.resolve(verifiedNews)
    }

    processes[index].news.push(newsURL)

    return new Promise(function(finishPromisse, reject) {
        //get all votes of news
        blockchain.getAllVotesToNews(newsURL).then(function(result) {
            //this result is an array of blocks(Block class) from the blockchain
            //get reputation of each user that voted but the ones that cannot be verified yet
            Promise.all(result.filter(value => { return !isInArray(value.userPublicKey, processes[index].users) }).map(value => { return calculateReputationOf(value.userPublicKey, processId)}))
                .then(function(users) {
                    //calculate veracity based on users reputatation
                    var userVotes = users.map ( user => {
                        var vote = result.find(value => { return value.userPublicKey == user.userPublicKey }).vote
                        return new UserVote(user, vote)
                    })
                    const news = calculateVeracity(newsURL, userVotes)
                    //let process know that user is already ok
                    finishesNewsValidationInProcess(news, processId)
                    finishPromisse(news)
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

function calculateReputationOf(userPublicKey, processId) {
    const index = processes.findIndex(value => { return value.id = processId })

    const verifiedUser = processes[index].verifiedUsers.find(value => {return value.userPublicKey == userPublicKey})
    if (verifiedUser != null) {
        return new Promise.resolve(verifiedUser)
    }

    processes[index].users.push(userPublicKey)

    return new Promise(function(finishPromisse, reject) {
        //get all votes made by user
        blockchain.getAllVotesBy(userPublicKey).then(function(result) {
            //this result is an array of blocks(Block class) from the blockchain
            //get veracity of each news voted by user but the ones that cannot be verified yet
            Promise.all(result.filter(value => { return !isInArray(value.newsURL, processes[index].news) }).map(value => { return verify(value.newsURL, processId)}))
                .then(function(newsVeracities) {
                    var newsVotes = newsVeracities.map ( newsVeracity => {
                        var vote = result.find(value => { return value.news == newsVeracity.url }).vote
                        return new NewsVote(newsVeracity, vote)
                    })
                    //calculate reputation of user based on their votes on each news
                    const userWithReputation = calculateReputation(userPublicKey, newsVotes)
                    //let process know that user is already ok
                    finishesUserValidationInProcess(userWithReputation, processId)
                    finishPromisse(userWithReputation)
                }, function(err) {reject(err)})
        }, function(error) {reject(error)})
    })
}

function calculateVeracity(news, userVotes) {
    //votes will be an array of UserVote

    if (userVotes.length < numVotesNecessaryToDetermineVeracity) {
        return new NewsVeracity(news, veracity.NEUTRAL, 0, 0)
    }

    //veracity
    var trueVotePoints = userVotes.filter( value => { return value.vote == true })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var falseVotePoints = userVotes.filter( value => { return value.vote == false })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var verac = trueVotePoints > falseVotePoints ? veracity.TRUE : veracity.FALSE

    //certainty
    var biggerPoints = trueVotePoints > falseVotePoints ? trueVotePoints : falseVotePoints
    var percentageOfPoints = biggerPoints/(trueVotePoints + falseVotePoints) * 100
    var certainty = percentageOfPoints - (100 - percentageOfPoints)

    var averageReputation = (trueVotePoints + falseVotePoints)/userVotes.length
    // NEED TO GET CLOSER REPUTATION

    return new NewsVeracity(news, verac, certainty, averageReputation)
}

function calculateReputation(userPublicKey, newsVotes) {
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

    return new User(userPublicKey, reput)
}

function finishesUserValidationInProcess(user, processId) {
    const index = processes.findIndex(value => { return value.id == processId })

    const indexOfUser = processes[index].users.findIndex(value => { return value == user.userPublicKey })
    processes[index].users.splice(indexOfUser, 1)

    processes[index].verifiedUsers.push(user)
}

function finishesNewsValidationInProcess(news, processId) {
    const index = processes.findIndex(value => { return value.id == processId })

    const indexOfNews = processes[index].news.findIndex(value => { return value == news.url })
    processes[index].news.splice(indexOfNews, 1)

    processes[index].verifiedNews.push(news)
}

function startNewsValidation(newsURL) {
    const processId = newsURL

    processes.push(new Process(processId))

    return new Promise(function (finishPromisse, reject) {
        verify(newsURL, processId).then((result) => {
            //remove processId
            var index = processes.indexOf(value => { return value.id == processId })
            processes.splice(index, 1)
            finishPromisse(result)
        }).catch((error) => {reject(error)})
    })
}

exports.addVote = add
exports.verifyNews = startNewsValidation