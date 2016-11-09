'use strict';

var api = require('../api/api'),
	db = require('../db/get-connection').db,
	linkLoader = require('./get-links-from-site'),
	redis = require('../db/redis');

var counter = 0,
	days = [7,10,14,20,21,28,30];

var decrementCounterAndKillProcess = () => {
	counter -= 1;

	if( counter === 0 ){
	    process.exit(0);
	}
};

var insertLinkIntoDatabase = ( link ) => {
	db.one('INSERT INTO links(id, href, text) VALUES($1, $2, $3)', [link.id, link.href, link.text])
		.catch((error)=> {
			//meh
		});
};

var updateRedis = ( param ) => {
	var keySuffix = param === null ? '' : ':' + param;
	counter += 4;

	api.methods.counts( param ).then(( result ) => {
		// console.log( result );
		redis.set( ['counts' + keySuffix, result.body] ).then( decrementCounterAndKillProcess );
		redis.expire( ['counts' + keySuffix, 3600] ).then( decrementCounterAndKillProcess );
	});
	api.methods.headlines( param ).then(( result ) => {
		// console.log( result );
		redis.set( ['headlines' + keySuffix, result.body] ).then( decrementCounterAndKillProcess );
		redis.expire( ['headlines' + keySuffix, 3600] ).then( decrementCounterAndKillProcess );
	})
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
		});
	}).then(() => {
		// cache today's results
		updateRedis( null );

		// cache results for days in the days array
		for( let i in days ){
			updateRedis( days[i] );
		}
	});
