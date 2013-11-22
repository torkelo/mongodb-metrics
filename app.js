
var RQ = require('./rq');
var _ = require('underscore');
var config = require('./config.json');
var readers = require('./lib/readers');
var writer = require('./lib/writer')(config);

function fetchDataForServer(requestion, server) {

	RQ.sequence([
		readers.connectToMongoDb,
		readers.fetchServerStatus,
		writer.toGraphiteMetricsArray(server, config.metrics.serverStatus),
		writer.sendToGraphite
	])(requestion, server);

}

function intervalLoop() {

	var	workArray = config.servers.map(function(server) {
		return function(requestion) {
			fetchDataForServer(requestion, server);
		};
	});

	RQ.parallel(workArray)(function(success, failure) {
		if (failure) {
			console.log('Error:', failure);
		}
		else {
			console.log('Metric fetched and sent to graphite for all servers');
		}
	});
}

setInterval(intervalLoop, config.intervalSeconds * 1000);
