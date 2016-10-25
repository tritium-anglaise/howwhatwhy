'use strict';

const htmlparser = require('htmlparser2');
const https = require('https');

let link = {},
    links = [],
    linkText = '',
    storyLink = false;

const parser = new htmlparser.Parser({
    onopentag: ( name, attribs )=> {
        if( name === 'tr' && attribs.class === 'athing' ){
            link.id = parseInt( attribs.id );
            storyLink = false;
        } else if( name === 'a' && attribs.class === 'storylink' ){
            storyLink =  true;
            link.href = attribs.href;
        } else {
            storyLink = false;
        }
    },
    ontext : ( text )=> {
        if( storyLink ){
            linkText += text;
        }
    },
    onclosetag: ()=> {
        if( storyLink ){
            storyLink = false;
            if( linkText.indexOf( '%' ) !== -1 ){
                // decodeURI will error if a '%' is in the string; so, split it apart,
                // run decodeURI on the pieces, and join them back together.
                linkText = linkText.split('%').map( decodeURIComponent ).join('%');
            } else {
                link.text = decodeURIComponent( linkText );
            }
            links.push( link );
            link = {};
            linkText = '';
        }
    }
});

const returnMatchingLinks = ( headlines )=> {
    let hnSpecific = /^(Ask|Show) HN/,
        matches = { "how": [], "what": [], "why": [] },
        regex,
        regexes = {
            // only match 'how' when it's at the beginning of the string or part
            // of 'here's how' which can appear anywhere.
            how: /^(h|H)ow|((H|h)ere's) (h|H)ow/,
            what: /\b(W|w)hat\b/,
            why: /\b(W|w)hy\b/
        };

    for( linkText of headlines ) {
        for( regex in regexes ) {
            if( !hnSpecific.test( linkText.text ) && regexes[ regex ].test( linkText.text ) ){
                matches[ regex ].push( linkText );
            }
        }
    }

    return matches;
};

exports.getLinks = () => {
    return new Promise(
        ( resolve, reject ) => {
            https.get( 'https://news.ycombinator.com', ( res )=> {
                res.on( 'data', ( d )=> {
                    parser.write( d );
                });
            }).on( 'close', ()=> {
                resolve( returnMatchingLinks( links ) );
            });
        }
    );
};
