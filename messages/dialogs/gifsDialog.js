const builder = require("botbuilder");
const helper = require("./helper.js").helper;

/*
    * Matches to 'gifs' intent from LUIS on recognition of intent, 
    * Uses helper methods from './helper.js' to perform Giphy API call 
*/

exports.dialog = function() {
    return [
        (session, results, next) => {
            session.send([
                'You\'ve requested a gif, now searching.',
                'Looking for gif...',
                'Just a second...'
            ]);

            let preHandledQ = session.message.text;
            let query = preHandledQ.replace(/^\/gif|^\/gifs|^gif/i,'');   
            session.privateConversationData.querySubject = query;
            query = query.replace(/\s/g, "+");
            session.dialogData.query = query;

            let keyword = builder.EntityRecognizer.findEntity(results.entities, 'gif.keyword');
            let keywords = helper.entitiesJoiner(builder.EntityRecognizer.findAllEntities(results.entities, 'gif.keywords'));
            
            keyword = keyword ? keyword.entity : null;
            keywords = keywords ? keywords : null;

            if (keyword && !keywords) {
                session.privateConversationData.querySubject = keyword;
                // session.send('keyword entity, From gifs.js: \'%s\'',keyword);
                session.dialogData.query = keyword.replace(/\s/g, "+");   
            } else if (keywords) { 
                session.privateConversationData.querySubject = keywords;
                // session.send('keywords.entity: \'%s\'', keywords);
                session.dialogData.query = keywords.replace(/\s/g, "+");
             }

            let returnedGif ='';
            helper.giphyCall(session)
            .then(response => {
                let results = JSON.parse(response);
                let randInt = Math.floor((Math.random()*100)+1);
                returnedGif = results.data[randInt]["images"]["original"]["url"]
                returnedGif = returnedGif.replace("\/", "/");

                let card = new builder.AnimationCard(session)
                    .title('Here is a gif of "%s"', session.privateConversationData.querySubject)
                    .subtitle(returnedGif)
                    .image(builder.CardImage.create(session, 'https://docs.botframework.com/en-us/images/faq-overview/botframework_overview_july.png'))
                    .media([
                        { url: returnedGif }
                    ]).buttons([
                        builder.CardAction.openUrl(session, returnedGif, 'View in browser')
                    ]);
                session.send('I looked for a gif using what you said. \'%s\'.', session.privateConversationData.querySubject);
                var cardMsg = new builder.Message(session).addAttachment(card);
                session.send(cardMsg);
                
                session.privateConversationData.querySubject = null;
                session.endDialog();
            });
        }
    ]
}