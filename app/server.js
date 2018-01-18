const api = require( '../api/api'),
    http = require( 'http' ),
    server = http.createServer().listen( process.env.PORT ),
    types = {
        json: 'application/json',
        text: 'text/plain'
    },
    validators = {
		isValidQueryString: (queryType, queryVal) => {
			return queryType === 'month' && typeof( queryVal ) !== 'undefined' && validators.isInteger( queryVal );
		},
        isInteger: ( param ) => { return !isNaN(parseInt( param )); }
    },
	processAPIRequest = ( queryVal ) => {
		return new Promise(( resolve, reject ) => {
			resolve( api.getHeadlines( queryVal ) );
		});
	},
	respond = ( res, status, type, body ) => {
		type = type === undefined ? types.text : type;
		body = body === undefined ? '' : body;

		res.writeHead( status, {
			'Content-Type': types[type],
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': 'GET',
		} );
		res.end( body );
	};

server.on( 'request', function( req, res ) {
	let api, collection, queryType, queryVal;
    [, api, collection] = req.url.toLowerCase().split( '/' );

    try {
		[queryType, queryVal] = collection.split('?')[1].split('=');
	}
	catch(e) {
    	respond( res, 200, 'text', '' );
	}

	// simple test to make sure the request is for the 'api' and that the querystring
	// conforms to our expectations
    if( api === 'api' && validators.isValidQueryString( queryType, queryVal ) ) {
        processAPIRequest( queryVal )
            .then(( data )=> {
                respond( res, data.status, data.type, data.body );
            }).catch(( data ) => {
				respond( res, 500, 'text', data.toString() );
			});
    } else {
		respond( res, 200, 'text', '' );
	}
});

console.log('Listening for requests on port ' + process.env.PORT);