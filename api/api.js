const db = require('../db/db').db,
	regexes = {
		how: /\b(h|H)ow\b/,
		what: /\b(W|w)hat\b/,
		why: /\b(W|w)hy\b/
	},
	getAdverbCounts = ( headlineObj )=> {
		for( var regex in regexes ) {
			if( regexes[ regex ].test( headlineObj.linktext ) ){
				headlineObj[ regex ] = true;
			}
		}

		return headlineObj;
	},
	returnDatabaseFunction = ( dbFuncName ) => {
		return function( param ) {
			return new Promise(( resolve, reject ) => {
				db.func(dbFuncName, param).then(( response )=> {
					resolve({ status: 200, type: 'json', body: JSON.stringify(response.map(getAdverbCounts))});
				}).catch(( err )=> {
					reject( err );
				});
			});
		}
	};

exports.getHeadlines = returnDatabaseFunction( 'get_links' );