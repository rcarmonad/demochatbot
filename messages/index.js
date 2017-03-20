/*-----------------------------------------------------------------------------
Demo ChatBot
-----------------------------------------------------------------------------*/
"use strict";
const builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
const https = require('https');

const helper = require("./dialogs/helper.js").helper;
const helpDialog = require("./dialogs/helpDialog.js").dialog();
const gifsDialog = require("./dialogs/gifsDialog.js").dialog();
const imgDialog = require("./dialogs/imgDialog.js").dialog();
const defaultDialog = require("./dialogs/defaultDialog.js").dialog();

const useEmulator = (process.env.NODE_ENV == 'development');

let connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

let bot = new builder.UniversalBot(connector);

const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
let luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

let recognizer = new builder.LuisRecognizer(LuisModelUrl);
let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .onDefault((session) => {
        session.replaceDialog('/default');
    });
intents.matches('gifs', (session, results) => {
        session.replaceDialog('/gifs', results);
    }
);
intents.matches('images', (session, results) => {
        session.replaceDialog('/imgs', results);
    }
);

bot.dialog('/help', helpDialog)
    .triggerAction({ matches: /^help/i })
    .cancelAction('/cancelDefault', ['Ending dialog.','Canceling current dialog.'],
    { matches: /^cancel$|^end$/i, 
        confirmPrompt: ['Are you sure you want to cancel?', 'Want to cancel?', 'Cancel this dialog?'] 
    });

bot.dialog('/reset', function (session) {
    session.endConversation('Exiting Conversation!');
}).triggerAction({ matches: /^exit$|^quit$|^reset$/i });

bot.dialog('/default', defaultDialog)
    .cancelAction('/cancelDefault', ['Ending dialog.','Canceling current dialog.'],
    { matches: /^cancel$|^end$/i, 
        confirmPrompt: ['Are you sure you want to cancel?', 'Want to cancel?', 'Cancel this dialog?']
    });
bot.dialog('/gifs', gifsDialog)
    .cancelAction('/cancelDefault', ['Ending dialog.','Canceling current dialog.'],
        { matches: /^cancel$|^end$/i, 
            confirmPrompt: ['Are you sure you want to cancel?', 'Want to cancel?', 'Cancel this dialog?'] 
        });
bot.dialog('/imgs', imgDialog)
    .cancelAction('/cancelDefault', ['Ending dialog.','Canceling current dialog.'],
    { matches: /^cancel$|^end$/i, 
        confirmPrompt: ['Are you sure you want to cancel?', 'Want to cancel?', 'Cancel this dialog?'] 
    });

bot.dialog('/', intents);    

if (useEmulator) {
    let restify = require('restify');
    let server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
