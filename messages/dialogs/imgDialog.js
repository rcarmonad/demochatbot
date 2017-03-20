const builder = require("botbuilder");
const helper = require("./helper.js").helper;

/*
    * Matches to 'images' intent from LUIS on recognition of intent, 
    * Uses helper method from './helper.js' ro perform Giphy API call 
*/

exports.dialog = function() {
    return [
        (session, results, next) => {
            session.send([
                'Looking for image...',
                'Searching online for image...',
                'Just a moment, looking for image now...'
            ]);
            let preHandledQ = session.message.text;
            let query = preHandledQ.replace(/^\/img|^\/imgs|^img|^imgs/i,'');
            session.privateConversationData.imgQSubject = query;
            query = query.replace(/\s/g, "+");
            session.dialogData.query = query;

            let keyword = builder.EntityRecognizer.findEntity(results.entities, 'img.subject');
            let keywords = helper.entitiesJoiner(builder.EntityRecognizer.findAllEntities(results.entities, 'img.subjects'));

            keyword = keyword ? keyword.entity : null;
            keywords = keywords ? keywords : null;

            if (keyword && !keywords) {
                session.privateConversationData.imgQSubject = keyword
                // console.log("imgDialog.js Line 30: keyword entity found, '%s'",keyword);
                session.dialogData.query = keyword.replace(/\s/g, "+");   
            } else if (keywords) {
                session.privateConversationData.imgQSubject = keywords
                // session.send("imgDialog.js Line 36: keywords entity found, '%s'",keywords);
                session.dialogData.query = keyword.replace(/\s/g, "+"); 
            }
            next();
        },

        (session, results) => {
           let returnedImg ='';
            helper.giphyCall(session)
            .then(response => {
                let results = JSON.parse(response);
                let randInt = Math.floor((Math.random()*100)+1);
                returnedImg = results.data[randInt]["images"]["original_still"]["url"]
                returnedImg = returnedImg.replace("\/", "/");

                let card = new builder.HeroCard(session)
                    .title('Here is an image of "%s"', session.privateConversationData.imgQSubject)
                    .subtitle(returnedImg)
                    .images([builder.CardImage.create(session, returnedImg)])
                    .buttons([
                        builder.CardAction.openUrl(session, returnedImg, 'View in browser')
                    ])
                session.send('I looked for a image using what you said, "%s".', session.privateConversationData.imgQSubject);
                var cardMsg = new builder.Message(session).addAttachment(card);
                session.send(cardMsg);
                session.endDialog();
            });
        }
    ]
}