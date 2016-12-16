var db = require('../db/get-connection').db;

function returnDatabaseFunction( dbFuncName ) {
	return function( param ) {
		param = param === null ? [] : [ param ];

		return new Promise(( resolve, reject ) => {
			db.func(dbFuncName, param).then(( response )=> {
				resolve({ status: 200, type: 'json', body: JSON.stringify(response[0])});
			}).catch(( err )=> {
				reject( err );
			});
		});
	}
}

exports.methods = {
	counts:  returnDatabaseFunction( 'get_counts' ),
	headlines: returnDatabaseFunction( 'get_links' )
};