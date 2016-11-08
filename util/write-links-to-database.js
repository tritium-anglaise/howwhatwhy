'use strict';

const db = require('../db/get-connection').db;
const linkLoader = require('./get-links-from-site');

var insertLinkIntoDatabase = ( link ) => {
	db.one('INSERT INTO links(id, href, text) VALUES($1, $2, $3)', [link.id, link.href, link.text])
		.catch((error)=> {
			//meh
		});
};

var writeSummaryToDatabase = ( ids )=> {
	return db.none(
		`INSERT INTO howwhatwhy(hows, whats, whys) VALUES('{${ids.how.join( ',' )}}', '{${ids.what.join( ',' )}}', '{${ids.why.join( ',' )}}')`
	);
};

linkLoader.getLinks()
	.then( ( links )=> {
		var linkIds = {};

		for( var type in links ) {
			var ids = [];

			if( links[type].length !== 0 ) {
				for( let link of links[type] ) {
					insertLinkIntoDatabase( link );
					ids.push( link.id );
				}
			}

			linkIds[ type ] = ids;
		}

		writeSummaryToDatabase( linkIds ).catch((err)=> {
			console.log( err );
			process.exit(1);
		}).then(()=>{
			process.exit(0);
		});
	});