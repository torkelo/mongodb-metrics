var _ = require('underscore');
var graphite = require('graphite');

module.exports = function(config) {

	function sanitizeKey(name) {
		return name.replace(/[^\w]/gi, '_');
	}

	function toGraphiteMetricsArray(server, metricMap, lastMetrics) {

		return function transformServerStatus(requestion, serverStatus) {
			var metrics = {
				keyValues: {},
				counters: {}
			};

			function getCounterDelta(key, currentValue)
			{
				metrics.counters[key] = currentValue;

				if (!lastMetrics || lastMetrics.counters[key] === undefined) {
					return 0;
				}

				// if current value is less than last then it has probably been reset
				if (currentValue < lastMetrics.counters[key]) {
					return currentValue;
				}

				return currentValue - lastMetrics.counters[key];
			}

			function addMetric(flattendKey, value, metricType) {
				var key;

				var templateData = {
					cluster: sanitizeKey(server.cluster),
					host: sanitizeKey(server.shortName || server.host),
					metric: sanitizeKey(flattendKey)
				};

				if (typeof value === 'boolean') {
					value = value ? 1 : 0;
				}

				if (metricType === "counter") {
					key = _.template(config.graphiteKeyTemplateCounters, templateData);
					metrics.keyValues[key] = getCounterDelta(key, value);
				}
				else {
					key = _.template(config.graphiteKeyTemplateGauges, templateData);
					metrics.keyValues[key] = value;
				}
			}

			function mapAndFlatten(propName, propValue, target, flattendMetricKey)
			{
				if (typeof target === 'object') {
					Object.getOwnPropertyNames(propValue).forEach(function(val) {
						mapAndFlatten(val, propValue[val], target[val], flattendMetricKey + "_" + val);
					});
				}
				else if (target !== undefined) {
					addMetric(flattendMetricKey, target, propValue);
				}
			}

			Object.getOwnPropertyNames(metricMap).forEach(function(val) {
				mapAndFlatten(val, metricMap[val], serverStatus[val], val);
			});

			requestion(metrics);
		};
	}

	function replicaSetToGraphiteMetrics(requestion, replicaStatus) {
		var metrics = { keyValues: {} };

		function addMetric(flattendKey, value, server) {
			if (value === undefined) {
				return;
			}

			var key;

			var templateData = {
				cluster: sanitizeKey(server.cluster),
				host: sanitizeKey(server.shortName || server.host),
				metric: sanitizeKey(flattendKey)
			};

			key = _.template(config.graphiteKeyTemplateGauges, templateData);
			metrics.keyValues[key] = value;
		}

		_.each(replicaStatus.members, function(member) {
			var server = _.find(config.servers, function(server) { return server.setMemberName === member.name });
			if (!server) {
				throw { message: 'unable to find replica set member in server list '};
			}

			addMetric('replicaset_health', member.health, server);
			addMetric('replicaset_state', member.state, server);
			addMetric('replicaset_ping_ms', member.pingMs, server);
			addMetric('replicaset_optime_i', member.optime.i, server);

			if (member.lastHeartbeat) {
				var lag = member.lastHeartbeat - member.optimeDate;
				addMetric('replicaset_lag_ms', lag, server);
			}
		});

		requestion(metrics);
	}

	function sendToGraphite(requestion, metrics) {
		var graphiteUrl = 'plaintext://' +
			config.graphiteHost + ':' +
			config.graphitePort + '/';

		var client = graphite.createClient(graphiteUrl);
		client.write(metrics.keyValues);

		console.log('writing to graphite:', metrics.keyValues);

		requestion(metrics);
	}

	return {
		toGraphiteMetricsArray: toGraphiteMetricsArray,
		sendToGraphite: sendToGraphite,
		replicaSetToGraphiteMetrics: replicaSetToGraphiteMetrics
	};
};