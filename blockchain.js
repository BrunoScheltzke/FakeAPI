const isMock = true

exports.addVote = function add(vote, toNews, byUser) {
    return isMock ? mockSaveVote(vote, toNews, byUser) : null
}

exports.getAllVotesToNews = function getAllVotesTo(news) {
    return isMock ? getAllVotesTo(news) : null
}

exports.getAllVotesBy = function getAllVotesBy(user) {
    return isMock ? mockGetAllVotesBy(user) : null
}






// Blockchain area
// const kVote = 'VoteKey'
// const kNews = 'NewsKey'
// const kUser = 'UserKey'






// MOCK AREA
class Block {
    constructor(vote, news, user) {
        this.vote = vote
        this.news = news
        this.user = user
    }
}

var mockVotesBlock = []

function mockSaveVote(someVote, someNews, someUser) {
    return new Promise(function(resolve, _reject) {
        var newBlock = new Block(someVote, someNews, someUser)
        mockVotesBlock.push(newBlock)
        resolve(mockVotesBlock)
    })
}

function getAllVotesTo(news) {
    return new Promise(function(resolve, _reject) {
        resolve(mockVotesBlock.filter(value.news == news))
    })
}

function mockGetAllVotesBy(user) {
    return new Promise(function(resolve, _reject) {
        resolve(mockVotesBlock.filter(value.user == user))
    })
}