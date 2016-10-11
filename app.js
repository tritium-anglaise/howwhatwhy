'use strict';

const htmlparser = require('htmlparser2');
const https = require('https');

let headline = '',
    headlines = [],
    storyLink = false;

let parser = new htmlparser.Parser({
    onopentag: function( name, attribs ){
        storyLink =  name === 'a' && attribs.class === 'storylink';
    },
    ontext : function( text ) {
        if( storyLink ){
            headline += text;
        }
    },
    onclosetag: function() {
        if( storyLink ){
            storyLink = false;
            headlines.push( headline );
            headline = '';
        }
    }
});

exports.handler = function( event, context, callback ) {
    https.get( 'https://news.ycombinator.com', (res)=> {
        res.on( 'data', function( d ) {
            parser.write( d );
        });
    }).on( 'close', function() {
        parser.done();
    });
};
