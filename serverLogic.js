const blockchain = require('./blockchain')

const numVotesToBeSpam = 100
const numVotesToBeLowHigh = 50
const numVotesToBeSpecialist = 200

const percentageOfErrorToBeSpam = 90
const percentageOfErrorToBeHigh = 20
const percentageOfErrorToBeSpecialist = 10

const numVotesNecessaryToDetermineVeracity = 50

const reputation = {
    SPAM: 0,
    LOW: 1,
    NEUTRAL: 3,
    HIGH: 50,
    SPECIALIST: 150
}

const reabilityIndex = {
    FALSE: 0,
    TRUE: 1,
    NEUTRAL: 2,
    FAKEISH: 3,
    TRUEISH: 4
}

class User {
    constructor(userPublicKey, reputation) {
        this.userPublicKey = userPublicKey
        this.reputation = reputation
    }
}

class NewsVeracity {
    constructor(url, veracity, certainty, relevance, reliabilityIndex, voters) {
        this.url = url
        this.veracity = veracity
        this.certainty = certainty
        this.relevance = relevance
        this.reliabilityIndex = reliabilityIndex
        this.voters = voters
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

function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

function add(encryptedVote, userPublicKey) {
    return new Promise(function(resolve, reject) {
        blockchain.addVote(encryptedVote, userPublicKey).then(function(result) {
            resolve(result)
        }).catch(function(error) {
            reject(error)
        })
    })
}

function calculateVeracity(news, userVotes) {
    //votes will be an array of UserVote

    //veracity
    var trueVotePoints = userVotes.filter( value => { return value.vote == true })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var falseVotePoints = userVotes.filter( value => { return value.vote == false })
                                .reduce((acc, val) => acc + val.user.reputation, 0)
    var verac = trueVotePoints > falseVotePoints ? true : false

    //certainty
    var biggerPoints = trueVotePoints > falseVotePoints ? trueVotePoints : falseVotePoints
    var percentageOfPoints = biggerPoints/(trueVotePoints + falseVotePoints) * 100
    var certainty = percentageOfPoints - (100 - percentageOfPoints)

    var averageReputation = (trueVotePoints + falseVotePoints)/userVotes.length
    // NEED TO GET CLOSER REPUTATION

    //calculate reability index
    var index = reabilityIndex.NEUTRAL
    if (userVotes.length > numVotesNecessaryToDetermineVeracity) {
        index = trueVotePoints > falseVotePoints ? reabilityIndex.TRUE : reabilityIndex.FALSE
    }

    return new NewsVeracity(news, verac, certainty, averageReputation, index, userVotes)
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

    if (index != null) {
        const indexOfUser = processes[index].users.findIndex(value => { return value == user.userPublicKey })
        processes[index].users.splice(indexOfUser, 1)

        processes[index].verifiedUsers.push(user)
    }
}

function finishesNewsValidationInProcess(news, processId) {
    const index = processes.findIndex(value => { return value.id == processId })

    if (index != null) {
        const indexOfNews = processes[index].news.findIndex(value => { return value == news.url })
        processes[index].news.splice(indexOfNews, 1)

        processes[index].verifiedNews.push(news)
    }
}

function calculateReputationOfUser(user, database, processId) {
    const index = processes.findIndex(value => { return value.id = processId })

    // const verifiedUser = processes[index].verifiedUsers.find(value => {return value.userPublicKey == user})
    // if (verifiedUser != null) {
    //     return Promise.resolve(verifiedUser)
    // }

    processes[index].users.push(user)

    const newsVoted = database.filter(value => { return value.userPublicKey == user })
    const newsEligible = newsVoted.filter(value => { return !isInArray(value.newsURL, processes[index].news) })
    const newsVeracities = newsEligible.map(value => { return calculateVeracityOfNews(value.newsURL, database, processId) })

    var newsVotes = newsVeracities.map ( newsVeracity => {
        var vote = newsEligible.find(value => { return value.newsURL == newsVeracity.url }).vote
        return new NewsVote(newsVeracity, vote)
    })
    //calculate reputation of user based on their votes on each news
    const userWithReputation = calculateReputation(user, newsVotes)
    //let process know that user is already ok
    finishesUserValidationInProcess(userWithReputation, processId)
    return userWithReputation
}

function calculateVeracityOfNews(newsURL, database, processId) {
    const index = processes.findIndex(value => { return value.id == processId })
    // const verifiedNews = processes[index].verifiedNews.find(value => {return value.url == newsURL})

    // if (verifiedNews != null) {
    //     return Promise.resolve(verifiedNews)
    // }

    processes[index].news.push(newsURL)

    const voters = database.filter(value => { return value.newsURL == newsURL })
    const votersEligible =  voters.filter(value => { return !isInArray(value.userPublicKey, processes[index].users) })

    //get unique users: users can vote multiple times
    var uniqueUsers = votersEligible.reduce((acc, inc) => {
        if(!acc.find( i => i.userPublicKey == inc.userPublicKey)) {
           acc.push(inc);
        }
        return acc;
    },[])

    const votersReputation = uniqueUsers.map(value => { return calculateReputationOfUser(value.userPublicKey, database, processId)})
    //calculate veracity based on users reputatation
    var userVotes = uniqueUsers.map ( user => {
        //get last vote made by user
        var votesByUserOnThisNews = database.filter(value => value.userPublicKey == user.userPublicKey)
        var sorted = votesByUserOnThisNews.sort(function(a, b) {
            // convert date object into number to resolve issue in typescript
            var slicedData1 = a.date.slice(0, -4)
            var slicedData2 = b.date.slice(0, -4)
            var date1 = new Date(slicedData1)
            var date2 = new Date(slicedData2)
            return date1 - date2
        })
        var vote = sorted[sorted.length - 1].vote
        return new UserVote(user, vote)
    })
    const news = calculateVeracity(newsURL, userVotes)
    //let process know that user is already ok
    finishesNewsValidationInProcess(news, processId)
    return news
}

function getTrendingNews() {
    return new Promise(function(finishPromisse, reject) {   
        blockchain.trendingNews(10).then(function(result) {
            const parsedResult = JSON.parse(result)
            const allNewsPromises = parsedResult
                .map(value => { return startNewsValidation(value) })

            Promise.all(allNewsPromises).then(function(newsVeracities) {
                finishPromisse(newsVeracities)
            }, function(error) {reject(error)})
        }, function(error) {reject(error)})
    })
}

function startNewsValidation(newsURL) {
    const processId = new Date().getUTCMilliseconds();

    processes.push(new Process(processId))

    return new Promise(function(finishPromisse, reject) {
        blockchain.getAllVotes().then(function(result) {
            //result will be an array of Block

            finishPromisse(calculateVeracityOfNews(newsURL, result, processId))

        }, function(error) {reject(error)})
    }, function(error) {reject(error)})
}

exports.getTrendingNews = getTrendingNews
exports.addVote = add
exports.verifyNews = startNewsValidation