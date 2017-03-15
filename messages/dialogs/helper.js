
"use strict"

const builder = require("botbuilder");
const https = require("https");

exports.helper = {
    giphyCall: function (responseObj, session) {
        let query = session.message.text.replace(' ', '\+');
        let options = {
            hostname: 'api.giphy.com',
            path: '/v1/gifs/search?q=' + query + '&api_key=dc6zaTOxFJmzC&rating=pg&limit=10',
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
    }
}
