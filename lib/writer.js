var _ = require('underscore');
var graphite = require('graphite');

module.exports = function(config) {

	var metricCounter = 0;

	function toGraphiteMetricsArray(server, metricMap) {

		return function transformServerStatus(requestion, serverStatus) {
			var metrics = {};

			function sanitizeKey(name) {
				return name.replace(/[^\w]/gi, '_');
			}

			function addMetric(flattendKey, value) {
				var templateData = {
					cluster: sanitizeKey(server.cluster),
					host: sanitizeKey(server.shortName || server.host),
					metric: sanitizeKey(flattendKey)
				};

				var key = _.template(config.graphiteKeyTemplate, templateData);
				metrics[key] = value;
			}

			function mapAndFlatten(propName, propValue, target, flattendMetricKey)
			{
				if (typeof target === 'object') {
					Object.getOwnPropertyNames(propValue).forEach(function(val) {
						mapAndFlatten(val, propValue[val], target[val], flattendMetricKey + "_" + val);
					});
				}
				else {
					addMetric(flattendMetricKey, target);
				}
			}

			Object.getOwnPropertyNames(metricMap).forEach(function(val) {
				mapAndFlatten(val, metricMap[val], serverStatus[val], val);
			});

			requestion(metrics);
		};
	}

	function sendToGraphite(requestion, keyValues) {
		var graphiteUrl = 'plaintext://' +
			config.graphiteHost + ':' +
			config.graphitePort + '/';

		var client = graphite.createClient(graphiteUrl);
		client.write(keyValues);

		console.log('writing to graphite:', keyValues);

		metricCounter = metricCounter + keyValues.length;
	}

	return {
		toGraphiteMetricsArray: toGraphiteMetricsArray,
		sendToGraphite: sendToGraphite
	};
};