
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var RQ = require('./rq.js');
var mongoDbUrl = 'mongodb://127.0.0.1:27017';

var toMongoDbCallback = function (requesition, db) {
	return function(err, data) {
		if (!err && db) {
			requesition({db: db, data: data});
		}
		requesition(data, err || undefined);
	}
};

function connectToMongoDb (requesition) {
	console.log("connecting to mongo: %s", mongoDbUrl);
	MongoClient.connect(mongoDbUrl, toMongoDbCallback(requesition));
};

function fetchServerStatus (requesition, db) {
	console.log("fetching serverStatus");
	var admin = db.admin();
	admin.serverStatus(toMongoDbCallback(requesition));
};

function fetchServerInfo (requesition, db) {
	console.log("fetching serverInfo");
	var admin = db.admin();
	admin.serverInfo(toMongoDbCallback(requesition));
};

function replSetGetStatus (requesition, db) {
	console.log("fetching replSetStatus");
	var admin = db.admin();
	admin.replSetGetStatus(toMongoDbCallback(requesition));
};

function listDatabases (requesition, db) {
	console.log("fetching database list");
	var admin = db.admin();
	admin.listDatabases(toMongoDbCallback(requesition, db));
}

function saveToGraphite (requesition, data) {
	console.log('Saving to graphite: ');
	console.log('Metrics: ', data);
	requesition(1);
}

function dbStats (requesition, params) {
	var db = params.db;
	var	databases = params.data.databases;

	var dbStatsRequestors = databases.map(function(database) {
		return function(callback) {
			console.log("getting dbStats for %s", database.name);
			var otherDb = db.db(database.name);
			otherDb.stats(toMongoDbCallback(callback));
		}
	});

	RQ.parallel(dbStatsRequestors)(requesition);
}

var result = RQ.sequence([
	connectToMongoDb,
	listDatabases,
	dbStats
]);

/*var result = RQ.sequence([
	connectToMongoDb,
	RQ.parallel([
		fetchServerStatus,
		RQ.sequence([
			listDatabases,
			dbStats
		])
	])

]);
*/

result(function (success, failure) {
	if (failure) {
		console.log("Error: ", failure);
	}
	else {
		console.log("Success!", success);
	}

	setTimeout(function() {
		process.exit();
	}, 500)
});



