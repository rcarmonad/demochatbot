/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
let https = require('https');
let helper = require("./dialogs/helper.js").helper;

var useEmulator = true // (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    // let card = new builder.HeroCard(session)
    //     .title('BotFramework Hero Card')
    //     .subtitle('Your bots — wherever your users are talking')
    //     .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
    //     .images([
    //         builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
    //     ])
    //     .buttons([
    //         builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Get Started')
    //     ]);
    let returnedGif ='';
    session.sendTyping();
    helper.giphyCall({}, session)
        .then(response => {
            let results = JSON.parse(response);
            let randInt = Math.floor(Math.random()*9);
            returnedGif = results.data[randInt]["images"]["original"]["url"]
            returnedGif = returnedGif.replace("\/", "/");

            let card = new builder.AnimationCard(session)
                .title('Microsoft Bot Framework')
                .subtitle('Animation Card')
                .image(builder.CardImage.create(session, 'https://docs.botframework.com/en-us/images/faq-overview/botframework_overview_july.png'))
                .media([
                    { url: returnedGif
                    /*'http://i.giphy.com/Ki55RUbOV5njy.gif'*/ }
                ]);
            // session.send(returnedGif);
            session.send('Sorry, I did not understand \'%s\'.', session.message.text);
            var cardMsg = new builder.Message(session).addAttachment(card);
            session.send(cardMsg);
        });

});
bot.dialog('/gifs', (session) => {
    let returnedGif ='';
    session.sendTyping();
    helper.giphyCall({}, session)
    .then(response => {
        let results = JSON.parse(response);
        let randInt = Math.floor(Math.random()*9);
        returnedGif = results.data[randInt]["images"]["original"]["url"]
        returnedGif = returnedGif.replace("\/", "/");

        let card = new builder.AnimationCard(session)
            .title(`Here is a gif of "` + session.message.text.replace('gif','') + '"')
            .subtitle(returnedGif)
            .image(builder.CardImage.create(session, 'https://docs.botframework.com/en-us/images/faq-overview/botframework_overview_july.png'))
            .media([
                { url: returnedGif
                /*'http://i.giphy.com/Ki55RUbOV5njy.gif'*/ }
            ]);
        // session.send(returnedGif);
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
        var cardMsg = new builder.Message(session).addAttachment(card);
        session.send(cardMsg);
        session.endDialog();
    });
}).triggerAction({matches: /^gifs|^gif/i})

bot.dialog('/', intents);    

intents.matches('')

bot.dialog('reset', function (session) {
    session.endConversation("Okay, goodbye!");
}).triggerAction({ matches: /^exit$|^quit$|^reset$/i});

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}


// let query = response.results.replace(" ", "+");

