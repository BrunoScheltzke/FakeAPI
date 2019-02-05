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

### Create a block
* /createBlock - POST

    A POST method at to enable the creation of a block in the chain.

    Call this method before adding any transaction to establish an identification.
    A block is created using a public key - RSA 1024

    #### Parameters POST body
    
    arg: Dictionary
    
        userPublicKey: base 64 str
            (The public key - RSA 1024)

    #### Returns

    arg: Dictionary
    
        aesKey: str
            (The 32 bytes AES server communication key encrypted using raw RSA with the given public key)
     
     --
     
        500 Error - For Invalid key format


### Adding a vote
* /vote - POST

     A POST method at to enable the creation of a vote
    
     Before adding a vote, it is necessary to create a block in the chain (by making a POST request at /createBlock) as a vote is represented as a transaction inside a block.
    
    #### Parameters POST body

    arg: Dictionary
    
        userPublicKey: str
            (The public key(RSA 1024))
        encryptedVote: str
            (A dictionary encrypted(AES CBC Padding PKCS7) with the 32 bytes 
            AES server communication key(received after creation of block))
                vote: base64Encoded str loadable as json dictionary)
                    userPublicKey: str
                    vote: Boolean
                    newsURL: base64Encoded str
                signature: base64Encoded str
                    (The vote dictionary signed with the private key(RSA 1024))

    #### Returns
    * 200 - Success
    * 500 - Error with statusMessage indicating error
        * 11 - No block found for given public key
        * 12 - No communication key (AES) found for given public key
        * 13 - Invalid signature
              
### Verifying veracity of news
* /news/:newsURL - GET

    A GET method to enable verifying the veracity of news

    #### Parameters Get
      ars: base64Encoded str
         (the news URL)
    
    #### Returns
    The veracity of news (Content in development)

## To do list:
- [x] Create endpoint to accept a vote to news
- [x] Create endpoint to verify the veracity of news
- [x] Algorith to verify user's reputation to determine veracity of news
- [x] Integrate with [open source blockchain](https://github.com/regio/r2ac) This will require modifications on blockchain project
- [x] Determine user's signing keys approach
- [ ] Determine users' reputation approach based on existent reputation researches
- [ ] Determine news veracity approach based on existent news veracity reseaches

## Author
[Bruno Scheltzke 🙋‍♂️](https://www.linkedin.com/in/brunoscheltzke/)
