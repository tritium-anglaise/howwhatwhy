const linkLoader = require('./link-loader'),
	db = require('./db-access'),
	s3 = require('./s3');

linkLoader.getLinks()
	.then( ( links )=> {
		var linkIds = {};

		for( var type in links ) {
			var ids = [];

			if( links[type].length !== 0 ) {
				for( let link of links[type] ) {
					db.insertLinkIntoDatabase( link );
					ids.push( link.id );
				}
			}

			linkIds[ type ] = ids;
		}

		db.writeSummaryToDatabase( linkIds ).then(()=> {
			s3.uploadToS3( links ).then(()=> {
				process.exit(0);
			}).catch((err)=> {
				console.log( err );
				process.exit(1);
			})
		});
	});