
var RQ = require('./app/rq');
var _ = require('underscore');
var config = require('./config.json');
var readers = require('./app/readers');

function fetchDataForInstance(serverName, instance) {
	var process = RQ.sequence([
		readers.connectToMongoDb,
		readers.fetchServerStatus
	]);

	process(function(success, failure) {

		if (failure) {
			console.log("Error: ", failure);
		}
		else {
			console.log("Success!", success);
		}

		setTimeout(function() {
			process.exit();
		}, 500);

	}, instance);
}

config.servers.forEach(function(srv) {
	srv.instances.forEach(function(instance) {
		fetchDataForInstance(srv.name, instance);
	});
});

/*function saveToGraphite (requesition, data) {
	console.log('Saving to graphite: ');
	console.log('Metrics: ', data);
	requesition(1);
}*/

/*var result = RQ.sequence([
	connectToMongoDb,
	fetchServerStatus
	//listDatabases,
	//dbStats
]);
*/
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

/*result(function (success, failure) {
	if (failure) {
		console.log("Error: ", failure);
	}
	else {
		console.log("Success!", success);
	}

	setTimeout(function() {
		process.exit();
	}, 500);
});
*/


