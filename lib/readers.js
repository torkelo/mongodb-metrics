
var MongoClient = require('mongodb').MongoClient,
	Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    Admin = require('mongodb').Admin,
    ReadPreference = require('mongodb').ReadPreference,
    RQ = require('../rq');

function toMongoDbCallback(requesition, db) {
	return function(err, data) {
		if (!err && db) {
			requesition({db: db, data: data});
		}
		requesition(data, err || undefined);
	};
}

function connectToMongoDb (requesition, server) {
	console.log('Connecting to mongodb: %s', server.host);

	var db = new Db("admin", new Server(server.host, server.port || 27017, {}, {}), { safe: false });

	db.open(toMongoDbCallback(requesition));

	// close db connection after 500ms
	setTimeout(function () {
		console.log('closing connection');
		db.close();
	}, 100);
}

function fetchServerStatus (requesition, db) {
	console.log('fetching serverStatus');
	db.command({ "serverStatus" : 1}, toMongoDbCallback(requesition));
}

function fetchServerInfo (requesition, db) {
	console.log('fetching serverInfo');
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
	fetchServerStatus: fetchServerStatus,
	replSetGetStatus: replSetGetStatus
};