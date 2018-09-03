import blockchain from './blockchain';

const numVotesToBeSpam = 140
const numVotesToBeLowHigh = 50
const numVotesToBeSpecialist = 200

const percentageOfErrorToBeSpam = 90
const percentageOfErrorToBeLow = 80
const percentageOfErrorToBeHigh = 20
const percentageOfErrorToBeSpecialist = 10

class User {
    constructor() {
        this.id = id;
        this.reputation = defineReputation;
        this.votes = votes;

        function defineReputation() {
            //     - Spam: Vota errado com frequência muito alta
            //     - Numero de noticias 140; Porcentagem de noticias erradas 90
            // - Médio Baixo: Tem votado errado ultimamente
            //     - Numero de noticias 50; Porcentagem de noticias erradas 65
            // - Iniciante/Neutro: Entrou há pouco
            //     - Numero de noticias ; Porcentagem de noticias erradas
            // - Médio Alto: Tem votado certo ultimamente 
            //     - Numero de noticias 50; Porcentagem de noticias erradas 20
            // - Referência/Especialista: Vota certo com frequência muito alta
            //     - Numero de noticias 200; Porcentagem de noticias erradas 5
            // - Validador: Entrou como uma referência de validador (Alguém para validar notícias e ajudar a calcular reputações)
            if (votes.length < numVotesToBeLowHigh) {
                return reputation.NEUTRAL;
            }
            if (votes.length >= numVotesToBeSpecialist) {
                // if specialist just return specialist
            }
            if (votes.length >= numVotesToBeSpam) {
                // if spam just return spam
            }
            if (votes.length >= numVotesToBeLowHigh) {
                // if low or high just return low or high
            }
        }
    }
}

class Vote {
    constructor() {
        this.user = user;
        this.vote = vote;
        this.news = news;
    }
}

class News {
    constructor() {
        this.url = url;
        this.authenticity;
    }
}

const reputation = {
    SPAM: 0,
    LOW: 1,
    NEUTRAL: 3,
    HIGH: 50,
    SPECIALIST: 150
}