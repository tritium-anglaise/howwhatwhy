'use strict';

const htmlparser = require('htmlparser2');
const https = require('https');
const pg = require('pg');

if( process.env.NODE_ENV !== undefined ){
    pg.defaults.ssl = true;
}

let headline = '',
    headlines = [],
    storyLink = false;

const parser = new htmlparser.Parser({
    onopentag: ( name, attribs )=> {
        storyLink =  name === 'a' && attribs.class === 'storylink';
    },
    ontext : ( text )=> {
        if( storyLink ){
            headline += text;
        }
    },
    onclosetag: ()=> {
        if( storyLink ){
            storyLink = false;
            headlines.push( headline );
            headline = '';
        }
    }
});

const returnCounts = ( headlines )=> {
    let counts = { how: 0, what: 0, why: 0 },
        regex,
        regexes = {
            // only match 'how' when it's at the beginning of the string or part
            // of a 'here's how' which can appear anywhere.
            how: /^(h|H)ow|((H|h)ere's) (h|H)ow/,
            what: /\b(W|w)hat\b/,
            why: /\b(W|w)hy\b/
        };

    for( headline of headlines ) {
        for( regex in regexes ) {
            if( regexes[ regex ].test( headline ) ){
                counts[ regex ]++;
            }
        }
    }

    return counts;
};

const writeCountsToDatabase = ( counts )=> {
    pg.connect( process.env.DATABASE_URL, (err, client)=> {
        if( err ){
            throw err;
        }

        client.query(`INSERT INTO howwhatwhy(how_count, what_count, why_count) VALUES(${ counts.how }, ${ counts.what }, ${ counts.why })`)
            .on('end', ()=> {
                process.exit(0);
            })
            .on('error', ()=> {
                process.exit(1);
            });
    });
};

https.get( 'https://news.ycombinator.com', ( res )=> {
    res.on( 'data', ( d )=> {
        parser.write( d );
    });
}).on( 'close', ()=> {
    writeCountsToDatabase( returnCounts( headlines ) );
});
