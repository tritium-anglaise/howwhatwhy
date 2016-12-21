'use strict';

var db = require('../db/db').db;

var api = require( '../api/api'),
    dateRegEx = /(20[1-2][0-9])-([0-1][0-2])-([0-3][0-9])$/,
    http = require( 'http' ),
    server = http.createServer().listen( process.env.PORT ),
    types = {
        json: 'application/json',
        text: 'text/plain'
    },
    validators = {
        isDate: ( param ) => { return dateRegEx.test( param ); },
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

var processAPIRequest = ( requestParts ) => {
    return new Promise(( resolve, reject ) => {
        var method, param;
        [,,method,param=null ] = requestParts;

        if( api.methods[ method ] !== undefined ){
            if( param !== null && paramIsValid( param ) ){
                resolve( api.methods[ method ]( parseParam( param ) ) );
            } else {
                resolve( api.methods[ method ]( null ) );
            }
        } else {
            reject( { status: 400, type: 'text', message: '' } );
        }
    });
};

var respond = ( res, status, type, body ) => {
    type = type === undefined ? types.text : type;
    body = body === undefined ? '' : body;

    res.writeHead( status, {'Content-Type': types[type]} );
    res.end( body );
};

server.on( 'request', function( req, res ) {
    var parts = req.url.toLowerCase().split( '/' );

    if( parts[1] === 'api' ) {
        processAPIRequest( parts )
            .then(( data )=> {
                respond( res, data.status, data.type, data.body );
            }).catch(( data ) => {
            respond( res, 500, 'text', data.toString() );
        });
    } else {
        respond( res, 200 );
    }
});