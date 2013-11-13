var MongoClient = require('mongodb').MongoClient;

function toMongoDbCallback(requesition, db) {
	return function(err, data) {
		if (!err && db) {
			requesition({db: db, data: data});
		}
		requesition(data, err || undefined);
	};
};

function connectToMongoDb (requesition, mongoDbUrl) {
	console.log("connecting to mongo: %s", mongoDbUrl);
	MongoClient.connect("mongodb://" + mongoDbUrl, toMongoDbCallback(requesition));
}

function fetchServerStatus (requesition, db) {
	console.log("fetching serverStatus");
	var admin = db.admin();
	admin.serverStatus(toMongoDbCallback(requesition));
}

function fetchServerInfo (requesition, db) {
	console.log("fetching serverInfo");
	var admin = db.admin();
	admin.serverInfo(toMongoDbCallback(requesition));
}

function replSetGetStatus (requesition, db) {
	console.log("fetching replSetStatus");
	var admin = db.admin();
	admin.replSetGetStatus(toMongoDbCallback(requesition));
}

function listDatabases (requesition, db) {
	console.log("fetching database list");
	var admin = db.admin();
	admin.listDatabases(toMongoDbCallback(requesition, db));
}

function dbStats (requesition, params) {
	var db = params.db;
	var	databases = params.data.databases;

	var dbStatsRequestors = databases.map(function(database) {
		return function(callback) {
			console.log("getting dbStats for %s", database.name);
			var otherDb = db.db(database.name);
			otherDb.stats(toMongoDbCallback(callback));
		};
	});

	RQ.parallel(dbStatsRequestors)(requesition);
}


module.exports = {
	connectToMongoDb: connectToMongoDb,
	fetchServerStatus: fetchServerStatus
};