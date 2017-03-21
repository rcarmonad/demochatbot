"use strict"
const builder = require("botbuilder");
const https = require("https");

/*
    * Helper module, contains giphyCall and entitiesJoiner
*/

const giphyAPIKey = process.env.GiphyBetaAPIKey

exports.helper = {
    giphyCall: function (session) {
        let query = session.dialogData.query;

        let options = {
            hostname: 'api.giphy.com',
            path: '/v1/gifs/search?q=' + query + '&api_key='+ giphyAPIKey+ '&rating=pg&limit=100',
            method: 'GET',
        };

        let response = '';
        return new Promise(function (resolve, reject) {
            https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    response += chunk;
                });
                res.on('error', function (err) {
                    return reject(err);
                });
                res.on('end', function () {
                    if (!response) {
                        return resolve('');
                    } else {
                        return resolve(response);
                    }
                });
            }).end();
        })
    },
    entitiesJoiner: function (arrOfEntities) {
        let stringKeywords = '';
        let whitespaces = 0;
        for (let i = 0; i < arrOfEntities.length; i++) {
            stringKeywords += arrOfEntities[i].entity;
            if (arrOfEntities.length - 1 != i) {
                stringKeywords += ' ';
            }
        }
        return stringKeywords;
    }
}
