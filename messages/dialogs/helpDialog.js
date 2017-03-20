const builder = require("botbuilder");
const helper = require("./helper.js").helper;


exports.dialog = function() {
    return [
        (session, args, next) => {
            if (!args.repeatDialog)    {
                session.send([
                    "How can I help you?",
                    "Do you require assistance?",
                    "How can I help?" 
                ]);
            }
            builder.Prompts.choice(session,
                ["Please select an option:", "Please choose an option:", "Please select one of the following choices:"],
                'Navigation/Dialogs | Help with Gifs | J/k don\'t need help'
            );
        },
        (session, results) => {
            switch (results.response.index) {
                case 0:
                    session.send('The commands available are "help", "/gif <keyword>", and "/img <keyword>". <br/> You may also type "exit", "quit", or "reset" to restart the conversation. <br/> In the same vein you can type "cancel" or "end" to exit any given dialog.');
                    builder.Prompts.confirm(session, ['Do you need more help?','Do you need help with something else?','Do you require assistance with something else?']);
                    break;
                case 1:
                    session.send('To receive a gif, simply type "/gif <keyword_here>" and a gif and link will appear.');
                    builder.Prompts.confirm(session, ['Do you need more help?','Do you need help with something else?','Do you require assistance with something else?']);
                    break;
                case 2:
                    session.endDialog('Okay! Have fun!');
                    break;
                default:
                    session.send('I\'m not sure how you got here...')
                    session.send(['I\'m sorry, I don\'t follow...', 'I don\'t understand, taking you back to the menu.']);
                    session.replaceDialog('/help', { repeatDialog: true });
                    break;
            }
        },
        (session, results) => {
            if (results.response) {
                session.replaceDialog('/help', { repeatDialog: true });
            } else {
                session.endDialog([
                    'ending dialog!',
                    'ending dialog, PEACE!',
                    'that\'s all there is to this dialog, I\'m outties'
                ]);
            }
        }
    ]
}