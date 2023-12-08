

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '¡Bienvenido al juego de preguntas sobre programación! ahora podrás iniciar el quiz al decirme comenzar juego.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const QuizHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        console.log("Dentro de QuizHandler");
        console.log(JSON.stringify(request));
        
        return request.type === "IntentRequest" && (request.intent.name === "QuizIntent" || request.intent.name === "AMAZON.StartOverIntent");
    },
    handle(handlerInput){
        console.log("Dentro de QuizHandler handle");
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const response = handlerInput.responseBuilder;
        
        
        /*INICIALIZAMOS CONSTANTES PARA INICIAR JUEGO*/
        attributes.name = names.QUIZ;
        attributes.counter = 0;
        attributes.quizScore = 0;
        
        var question = askQuestion(handlerInput);
        var speakOutput = "Te haré 10 preguntas para probar tu conocimiento. Mucha suerte con eso " + question;
        var repromptOutput = question;
        
        
        var item = attributes.quizItem;
        const property = attributes.quizProperty;
        
        
        return response.speak(speakOutput)
                        .reprompt(repromptOutput)
                        .getResponse();
    },
};


const QuizAnswerHandler = {
  canHandle(handlerInput) {
    console.log("Dentro de QuizAnswerHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.name === names.QUIZ &&
           request.type === 'IntentRequest' &&
           request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Dentro de QuizAnswerHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;

    var speakOutput = ``;
    var repromptOutput = ``;
    const item = attributes.quizItem;
    const property = attributes.quizProperty;
    const isCorrect = compareSlots(handlerInput.requestEnvelope.request.intent.slots, item.Nombre_Lenguaje);

    if (isCorrect) {
      speakOutput = getSpeechCon(true);
      attributes.quizScore += 1;
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else {
      speakOutput = getSpeechCon(false);
    }

    speakOutput += getAnswer(property, item);
    var question = ``;
    
    if (attributes.counter < 10) {
      speakOutput += getCurrentScore(attributes.quizScore, attributes.counter);
      question = askQuestion(handlerInput);
      speakOutput += question;
      repromptOutput = question;

     
      return response.speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
    }
    else {
      speakOutput += getFinalScore(attributes.quizScore, attributes.counter) + "Gracias por jugar, ahora eres más inteligente"
      }
      return response.speak(speakOutput).getResponse();
  },
};


/*EDITAR ESTAS AL ESPAÑOL*/
const speechConsCorrect = ['¡excelente!', 'buen trabajo', 'este juego es todo tuyo', 'estudiaste a la perfección', 'sigue así', '¡bien! no olvides ayudar a tus amigos', 'eres muy inteligente', '¡woow!', 'eres dinamita amigo'];
const speechConsWrong = ['¡oooh no!', 'no me hagas eso', 'vaya vaya', 'alguien no estudio lo suficiente', '¡rayoos!', 'no podrías estar más equivocado', '¡nooo!', 'ni modo', 'siguele intentando amigo', 'ánimo estudia más'];


const data = [
    {Nombre_Lenguaje: "python",  Creacion: 1991, inventor: "Guido Van"},
    {Nombre_Lenguaje: "c",       Creacion: 1969, inventor: "Dennis Ritchie"},
    {Nombre_Lenguaje: "c++",     Creacion: 1983, inventor: "Bjarne Stroustrup"},
    {Nombre_Lenguaje: "fortran", Creacion: 1957, inventor: "John Backus"},
    {Nombre_Lenguaje: "cobol",   Creacion: 1959, inventor: "Grace Murray Hopper"},
    {Nombre_Lenguaje: "basic",   Creacion: 1964, inventor: "Dartmounth College"},
    {Nombre_Lenguaje: "pascal",  Creacion: 1970, inventor: "Blause Pascal"},
    {Nombre_Lenguaje: "ruby",    Creacion: 1993, inventor: "Yukihiro Matsumoto"},
    {Nombre_Lenguaje: "php",     Creacion: 1995, inventor: "Rasmus Lerdoff"},
    {Nombre_Lenguaje: "java",    Creacion: 1995, inventor: "James Gosling"},
    {Nombre_Lenguaje: "c#",      Creacion: 1999, inventor: "Anders Hejlsberg"},
    {Nombre_Lenguaje: "sql",     Creacion: 1970, inventor: "Donald D"},
    {Nombre_Lenguaje: "swift",   Creacion: 2010, inventor: "Chris Lattner"},
    {Nombre_Lenguaje: "rust",    Creacion: 2010, inventor: "Graydon Hoare"},
    {Nombre_Lenguaje: "kotlin",  Creacion: 2010, inventor: "JetBrains"},
    {Nombre_Lenguaje: "scheme",  Creacion: 1975, inventor: "Guy L."},
    {Nombre_Lenguaje: "erlang",  Creacion: 1986, inventor: "Joe Armstrong"},
    {Nombre_Lenguaje: "elixir",  Creacion: 2012, inventor: "Jose Valim"},
    {Nombre_Lenguaje: "pascal",  Creacion: 1970, inventor: "Niklaus Wirth"},
    {Nombre_Lenguaje: "scala",   Creacion: 2003, inventor: "Martin Odersky"}
];


function compareSlots(slots, value) {
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].value.toString().toLowerCase() === value.toString().toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function getSpeechCon(type){
    if(type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}


function getRandom(min, max){
    return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function getQuestion(counter, property, item){
    return `¿Qué lenguaje fue inventado por ${item.inventor} ?`
}

function getAnswer (property, item){
    return `Fue ${item.Nombre_Lenguaje} y lo creó en el año ${item.Creacion}.  `
}

function getBadAnswer(item) {
  return `Lo siento es muy dificil saber eso pero puedes comenzar el juego`;
}

function getCurrentScore(score, counter) {
  return `Tu puntuación hasta ahora es ${score} de ${counter}  `;
}

function getFinalScore(score, counter) {
  return `Tu puntuación final es  ${score} de ${counter}.`;
}

function askQuestion(handlerInput){
    console.log("Estamos en la funcion pregunta");
    
    const random = getRandom(0, data.length -1);
    const item = data[random];
    const propertyArray = Object.getOwnPropertyNames(item);
    const property = propertyArray[getRandom(1, propertyArray.length -1)];
    
    
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    attributes.selectedItemIndex = random;
    attributes.quizItem = item;
    attributes.quizProperty = property;
    attributes.counter += 1;
    
    
    handlerInput.attributesManager.getSessionAttributes(attributes);
    
    const question = getQuestion(attributes.counter, property, item);
    return question;
} 

const names = {
    START: '_START',
    QUIZ: '_QUIZ',
}

function getItem(slots) {
  const propertyArray = Object.getOwnPropertyNames(data[0]);
  let slotValue;

  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      slotValue = slots[slot].value;
      for (const property in propertyArray) {
        if (Object.prototype.hasOwnProperty.call(propertyArray, property)) {
          const item = data.filter(x => x[propertyArray[property]]
            .toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
          if (item.length > 0) {
            return item[0];
          }
        }
      }
    }
  }
  return slotValue;
}

const RepeatHandler = {
  canHandle(handlerInput) {
    console.log("Inside RepeatHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.name === names.QUIZ &&
           request.type === 'IntentRequest' &&
           request.intent.name === 'AMAZON.RepeatHandler';
  },
  handle(handlerInput) {
    console.log("Inside RepeatHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const question = getQuestion(attributes.counter, attributes.quizproperty, attributes.quizitem);

    return handlerInput.responseBuilder
      .speak(question)
      .reprompt(question)
      .getResponse();
  },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'No puedo ayudarte con eso pero, podemos iniciar el juego sólo pídemelo';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Nos vemos pronto';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, ¿podrías intentar de nuevo?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento no comprendí lo que decías, por favor intentalo después';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        QuizHandler,
        QuizAnswerHandler,
        RepeatHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();