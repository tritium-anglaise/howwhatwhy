var db = require('../db/get-connection').db;

function getCounts( param ) {
	param = param === null ? [] : [ param ];

	return new Promise(( resolve, reject ) => {
		db.func('get_counts', param).then(( response )=> {
			resolve({ status: 200, type: 'json', body: JSON.stringify(response[0])});
		}).catch(( err )=> {
			reject( err );
		})
	});
}

function getHeadlines( param ) {
	param = param === null ? [] : [ param ];

	return new Promise(( resolve, reject ) => {
		db.func('get_links', param).then(( response ) => {
			resolve( {status: 200, type: 'json', body: JSON.stringify(response)} );
		}).catch(( err ) => {
			reject( err );
		});
	});
}

exports.methods = {
	counts:  getCounts,
	headlines: getHeadlines
};