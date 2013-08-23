var express = require('express'),
	cradle = require('cradle');

var config = {
	cache: false,
	host: process.env.COUCHDB_HOST,
	port: parseInt(process.env.COUCHDB_PORT || 443),
	raw: false,
	secure:true,
	auth : {
		username : process.env.COUCHDB_USERNAME,
		password : process.env.COUCHDB_PASSWORD
	}
};

var db = new(cradle.Connection)(config).database('jbot');

db.save('_design/messages', {
	views:{
		all: {
			map: function (doc) {
				if (doc.date && doc.user) emit(doc.date, doc);
			}
		}
	}
}, function(err,res){
	console.log("got",err,res);
});

var app = express();
app.get('/', function( req, res, next ){

	db.view('messages/all', function (err, data) {
		if ( err ) return next(err);
		
		data.forEach(function (row) {
			res.write(row.date+"\t"+row.user.name+":\t"+row.text+"\n");
		});
		res.end();
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});