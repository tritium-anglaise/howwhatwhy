'use strict';

var db = require('../db/get-connection').db;

var api = require( '../api/api'),
    http = require( 'http' ),
    redis = require( '../db/redis' ),
    server = http.createServer().listen( process.env.PORT ),
    types = {
        json: 'application/json',
        text: 'text/plain'
    },
    validators = {
        isDate: ( param ) => { return /(20[1-2][0-9])-([0-1][0-2])-([0-3][0-9])$/.test( param ); },
        isInteger: ( param ) => { return !isNaN(parseInt( param )); }
    };

var paramIsValid = ( param ) => {
    if( validators.isDate( param ) ){
        return true;
    } else {
        return validators.isInteger( param );
    }
};

var parseParam = ( param ) => {
    if( validators.isDate( param ) ){
        return param;
    } else if( validators.isInteger( param ) ){
        return parseInt( param );
    } else {
        return null;
    }
};

var returnResponseObj = ( partialResponse ) => {
    var responseObj = {
        body: partialResponse.body === undefined ? '' : partialResponse.body,
        status: partialResponse.status === undefined ? 200 : partialResponse.status,
        type: partialResponse.type === undefined ? types.text : types[ partialResponse.type ]
    };

    return responseObj;
};

var cacheInRedisAndResolve = ( resolver, redisKey, redisValue ) => {
    redis.setKeyAndExpiry( redisKey, redisValue, 3660 );
    resolver( returnResponseObj({body: redisValue, type: 'json'}) );
};

var processAPIRequest = ( requestParts ) => {
    return new Promise(( resolve, reject ) => {
        var method, param, redisKey;
        [,,method,param=null ] = requestParts;

        if( api.methods[ method ] !== undefined ){
            redisKey = method + ':' + param;

            if( param !== null && paramIsValid( param ) ){
                redis.get( redisKey ).then(( redisResponse ) => {
                    if( redisResponse !== null ){
                        resolve( returnResponseObj({ body: redisResponse, type: 'json' }) );
                    } else {
                        // get the requested value from the database
                        api.methods[ method ]( parseParam( param ) )
                            .then(( pgResponse ) => {
                                cacheInRedisAndResolve( resolve, redisKey, pgResponse );
                            });
                    }
                });
            } else {
                api.methods[ method ]( null ).then(( pgResponse ) => {
                    cacheInRedisAndResolve( resolve, redisKey, pgResponse );
                });
            }
        } else {
            reject( { status: 400, message: '' } );
        }
    });
};

var respond = ( res, responseObj ) => {
    res.writeHead( responseObj.status, {'Content-Type': types[responseObj.type]} );
    res.end( responseObj.body );
};

server.on( 'request', function( req, res ) {
    var parts = req.url.toLowerCase().split( '/' );

    if( parts[1] === 'api' ) {
        processAPIRequest( parts )
            .then(( apiResponse )=> {
                respond( res, apiResponse );
            }).catch(( error ) => {
                respond( res, returnResponseObj({ body: error.toString(), status: 500 }));
            });
    } else {
        respond( res, returnResponseObj({}) );
    }
});