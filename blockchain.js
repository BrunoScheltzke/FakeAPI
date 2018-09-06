const isMock = true

exports.addVote = function add(vote, toNews, byUser) {
    return isMock ? mockSaveVote(vote, toNews, byUser) : null
}

exports.getAllVotesToNews = function getAllVotesTo(news) {
    return isMock ? mockGetAllVotesTo(news) : null
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
        this.date = new Date()
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

function mockGetAllVotesTo(news) {
    return new Promise(function(resolve, _reject) {
        console.log('This are the mockVotesBlock!!')
        console.log(mockVotesBlock)

        console.log('This is the news!!')
        console.log(news)
        console.log(mockVotesBlock.filter(value => { return value.news == news }))
        resolve(mockVotesBlock.filter(value => { return value.news == news }).sort(function(a, b) {
            // convert date object into number to resolve issue in typescript
            return  +new Date(a.date) - +new Date(b.date);
          }))
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