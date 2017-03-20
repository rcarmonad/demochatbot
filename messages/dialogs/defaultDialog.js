const builder = require("botbuilder");
const helper = require("./helper.js").helper;

/*
    * 
    * 
    * 
*/

exports.dialog = function() {
    return [
        (session, results, next) => {
            let convoData = session.conversationData;
            if (!convoData.skipFirstStep && !convoData.restartDefault) {
                    session.send(['Hello!','Hi there!']);
                    session.send(['This is a demo chatbot that uses the giphy.com API to retrieve a random gif or image on command.'])
                session.conversationData.skipFirstStep = true;
                next();
            } else if (convoData.restartDefault) {
                next();
            } else {
                builder.Prompts.confirm(session, 'I didn\'t quite understand that, would you like me to give you more information?');
            }
        },
        (session, results, next) => {
            if (results.response || session.conversationData.skipFirstStep || session.conversationData.restartDefault) {
                session.conversationData.restartDefault = false;
                builder.Prompts.choice(session,
                ['What can I help you with?','How can I help you?'],
                'Brief description of bot | Technologies used for this bot | Exiting the converation or dialogs | Nevermind');    
            } else {
                session.send('Okay! If you need any help with anything, type "help" at anytime for assistance.');
                session.endDialog('Exiting dialog.');
            }
        },
        (session, results) => {
            switch (results.response.index) {
                case 0:
                    session.send('This chatbot helps with obtaining gifs and images using the Giphy API. <br/> To use it, type /gif <keyword> or /img <keyword> and an API call to Giphy will occur to retrieve the gif/image.');
                    session.send('You may also use more natural language, such as "I want a gif of puppies", or "Get me an image of Luke Skywalker".')
                    builder.Prompts.confirm(session, 'Would you like to go back to the help menu? If not, this dialog will close.')
                    break;
                case 1:
                    session.send('I was built using Microsoft\'s Bot Framework for Node.JS, the LUIS API, and Giphy\'s API. <br/> I am hosted using Azure Bot Service. GitHub is being used for continuous integration.');
                    builder.Prompts.confirm(session, 'Would you like to go back to the help menu? If not, this dialog will close.');
                    break;
                case 2:
                    session.send('At anytime you may type "exit" to reset the entire conversation.<br/>If you type "cancel" or "end", you can end your current dialog.')
                case 3:
                    session.endDialog('Okay! If you need any help with anything, type "help" at anytime for assistance.');
                    break;
    
            }
        },
        (session, results) => {
            if (results.response) {
                session.conversationData.restartDefault = true;
                session.replaceDialog('/default');
            } else {
                session.endDialog('Okay! If you need any help with anything, type "help" at anytime for assistance.');
            }
        }
    ]
}