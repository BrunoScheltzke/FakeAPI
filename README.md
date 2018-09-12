# FakeAPI

<Being developed>

An API to collect and process people's opinions about news they see on the internet and determine their authenticity.
People create a reputation based on their opinions and this reputation affects on the algorithm that determines the news veracity.

## Collaboration: 
This project is to integrate with an [open source blockchain](https://github.com/regio/r2ac)

Two projects are currently being implemented to consume this api:
- [iPhone app - FakeApp](https://github.com/BrunoScheltzke/FakeApp)
- [Google Chrome plugin - nofakenews](https://github.com/brunohlippert/nofakenews)

## Installation
#### Clone the project
`$ git clone https://github.com/BrunoScheltzke/FakeAPI.git`

#### Get Node
[Download](https://nodejs.org/en/) or [install from your prefered package manager](https://nodejs.org/en/download/package-manager/)

#### Install the dependencies
* `$ npm install got`
* `$ npm install --save form-data`
* `$ npm install express`
* `$ npm install body-parser`

#### Run the project
`$ node fakeapi.js`

## API
The project is currently being run at http://localhost:3000/ with the following endpoints
* /vote - POST
  * { vote: theVote,
      news: theNewsURL,
      user: theUserId }
* /news/:newsURL - GET

## To do list:
- [x] Create endpoint to accept a vote to news
- [x] Create endpoint to verify the veracity of news
- [x] Algorith to verify user's reputation to determine veracity of news
- [ ] Integrate with [open source blockchain](https://github.com/regio/r2ac) This will require modifications on blockchain project
- [ ] Determine user's signing keys approach
- [ ] Determine users' reputation approach based on existent reputation researches
- [ ] Determine news veracity approach based on existent news veracity reseaches

## Author
[Bruno Scheltzke 🙋‍♂️](https://www.linkedin.com/in/brunoscheltzke/)
