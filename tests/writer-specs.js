var should = require('should');

describe('when transforming mongo db metrics', function() {
	var result;

	var serverStatus = require('./serverStatus.json');
	var metricMap = {
		connections: { current: 1, available: 1 },
		backgroundFlushing: { last_ms: 1 },
	};

	var server = {
		cluster: 'muppet',
		host: 'muppet.prod.app.com'
	};

	var config = {
		"graphite-key-template": "test.databases.<%= cluster %>.<%= host %>.<%= metric %>"
	};

	var writer = require('../lib/writer')(config);

	before(function(done) {
		done();
	});

	describe('without short hostname default', function() {

		before(function(done) {
			var func = writer.toGraphiteMetricsArray(server, metricMap);

			func(function(success, failure) {
				result = success;
				done();
			}, serverStatus);
		});


		it('should transform to array with flat key value', function(done) {
			result['test.databases.muppet.muppet_prod_app_com.connections_current'].should.equal(145);
			result['test.databases.muppet.muppet_prod_app_com.backgroundFlushing_last_ms'].should.equal(25);
			done();
		});

	});


	describe('with short hostname default', function() {

		before(function(done) {
			server.shortName = "shorty";
			var func = writer.toGraphiteMetricsArray(server, metricMap);

			func(function(success, failure) {
				result = success;
				done();
			}, serverStatus);
		});


		it('should use shortname instead of host', function(done) {
			result['test.databases.muppet.shorty.connections_current'].should.equal(145);
			result['test.databases.muppet.shorty.backgroundFlushing_last_ms'].should.equal(25);
			done();
		});

	});

});