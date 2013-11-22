var _ = require('underscore');

module.exports = function(config) {

	function toGraphiteMetricsArray(server, metricMap) {

		return function transformServerStatus(requestion, serverStatus) {
			var metrics = [];

			function sanitizeKey(name) {
				return name
					.replace(/[^\w]/gi, '_')
			}

			function addMetric(flattendKey, value) {
				var templateData = {
					cluster: sanitizeKey(server.cluster),
					host: sanitizeKey(server.shortName || server.host),
					metric: sanitizeKey(flattendKey)
				};
				var key = _.template(config["graphite-key-template"], templateData);
				metrics.push({ key: key, value: value });
			}

			function mapAndFlatten(propName, propValue, target, flattendMetricKey)
			{
				if (typeof target == "object") {
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
		}
	}

	return {
		toGraphiteMetricsArray: toGraphiteMetricsArray
	};
};