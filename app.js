
var RQ = require('./rq');
var _ = require('underscore');

var path = require('path');
var appPath = path.dirname(process.mainModule.filename);
var configPath = path.join(appPath, 'config.js');
var config = require(configPath);

var readers = require('./lib/readers');
var writer = require('./lib/writer')(config);

function fetchDataForServer(requestion, server, lastMetrics) {
	RQ.sequence([
		readers.connectToMongoDb,
		readers.fetchServerStatus,
		writer.toGraphiteMetricsArray(server, config.metrics.serverStatus, lastMetrics),
		writer.sendToGraphite
	])(requestion, server);
}

function fetchReplicaStatus(requestion, server) {
	RQ.sequence([
		readers.connectToMongoDb,
		readers.replSetGetStatus,
		writer.replicaSetToGraphiteMetrics,
		writer.sendToGraphite
	])(requestion, server);
}

var lastResultArray = [];

function intervalLoop() {

	var	workArray = config.servers.map(function(server, index) {
		return function(requestion) {
			fetchDataForServer(requestion, server, lastResultArray[index]);
		};
	});

	RQ.parallel(workArray)(function(success, failure) {
		if (failure) {
			console.log('Error:', failure);
		}
		else {
			lastResultArray = success;
			console.log('ServerStatus fetched and set to graphite');
		}
	});

	var clusters = _.values(_.groupBy(config.servers, 'cluster'));
	var work = clusters.map(function(servers) {

		var	replicaWork = config.servers.map(function(server, index) {
			return function(requestion) {
				fetchReplicaStatus(requestion, server);
			};
		});

		return RQ.fallback(replicaWork);
	});

	RQ.parallel(work)(function(success, failure) {
		if (failure) {
			console.log('Error:', failure);
		}
		else {
			console.log('ReplicaSetStatus fetched and set to graphite');
		}
	});
}

setInterval(intervalLoop, config.intervalSeconds * 1000);
