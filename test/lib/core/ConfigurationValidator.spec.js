(function(){
	"use strict";

	require('../../bootstrap')();

	var oConfigurationValidator;

	describe("/lib.core.ConfigurationValidator.prototype - Inspection", function() {
		it("Should be an object",function() {
			var _oConfigurationValidator = require(process.cwd()+ '/lib/core/ConfigurationValidator');

			chai.expect(typeof _oConfigurationValidator).to.equal("object");
		});
		it("Should be a singleton",function() {
			var _oConfigurationValidator = require(process.cwd()+ '/lib/core/ConfigurationValidator');
			var _oAnotherConfigValidator = require(process.cwd()+ '/lib/core/ConfigurationValidator');

			chai.expect(_oConfigurationValidator).to.equal(_oAnotherConfigValidator);
		});
	});

	describe("/lib.core.ConfigurationValidator.prototype - ConfigurationValidator", function() {
		beforeEach(function(){
			oConfigurationValidator = require(process.cwd() + '/lib/core/ConfigurationValidator.js');
		});

		describe("#Proxy Mapping", function() {
			describe("#Validation of mandatory fields", function() {
				it("Should throw an error if the 'context' property is missing",function() {
					var oProxyMapping = {
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping);
					}).to.throw('Error defining Proxy. Missing mandatory property "context" on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property is an empty string",function() {
					var oProxyMapping = {
						context : '',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property is not a string",function() {
					var oProxyMapping = {
						context : 21213,
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property does not start with a '/' slash",function() {
					var oProxyMapping = {
						context : 'missingslash',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" should start with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property ends with a '/' slash",function() {
					var oProxyMapping = {
						context : '/slashatend/',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is missing",function() {
					var oProxyMapping = {
						context : '/api'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping)
					}).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is an empty string",function() {
					var oProxyMapping = {
						context : '/api',
						host :  ''
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is an unsupported type",function() {
					var oProxyMapping = {
						context : '/api',
						host :  12321313
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property ends with a slash '/'",function() {
					var oProxyMapping = {
						context : '/api',
						host :  'www.google.com/'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property starts with a slash '/'",function() {
					var oProxyMapping = {
						context : '/api',
						host :  '/www.google.com'
					};
					chai.expect(function(){
						oConfigurationValidator.validateDefaultMandatoryProperties(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});

				describe("#Validation of mandatory fields of 'proxyTunnel' configuration", function() {
					it("Should throw an error if the 'host' property is missing",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxyTunnel : {
								//missing host
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyTunnelMandatoryProperties(oProxyMapping.proxyTunnel)
						}).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping.proxyTunnel,2));
					});
					it("Should throw an error if the 'host' property is an empty string",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxyTunnel : {
								host : ''
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyTunnelMandatoryProperties(oProxyMapping.proxyTunnel)
						}).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping.proxyTunnel,2));
					});
					it("Should throw an error if the 'host' property is an unsupported type",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxyTunnel : {
								host : 111111
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyTunnelMandatoryProperties(oProxyMapping.proxyTunnel)
						}).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping.proxyTunnel,2));
					});
					it("Should throw an error if the 'host' property ends with a slash '/'",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxyTunnel : {
								host : 'proxy/'
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyTunnelMandatoryProperties(oProxyMapping.proxyTunnel)
						}).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping.proxyTunnel,2));
					});
					it("Should throw an error if the 'host' property starts with a slash '/'",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxyTunnel : {
								host : '/proxy'
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyTunnelMandatoryProperties(oProxyMapping.proxyTunnel)
						}).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping.proxyTunnel,2));
					});
				});
				describe("#Validation of mandatory fields of 'proxy' configuration", function() {
					it("Should throw an error if the 'host' property is missing",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxy : {
								//missing host
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyMandatoryProperties(oProxyMapping.proxy)
						}).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping.proxy,2));
					});
					it("Should throw an error if the 'host' property is an empty string",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxy : {
								host : ''
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyMandatoryProperties(oProxyMapping.proxy)
						}).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping.proxy,2));
					});
					it("Should throw an error if the 'host' property is an unsupported type",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxy : {
								host : 111111
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyMandatoryProperties(oProxyMapping.proxy)
						}).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping.proxy,2));
					});
					it("Should throw an error if the 'host' property ends with a slash '/'",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxy : {
								host : 'proxy/'
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyMandatoryProperties(oProxyMapping.proxy)
						}).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping.proxy,2));
					});
					it("Should throw an error if the 'host' property starts with a slash '/'",function() {
						var oProxyMapping = {
							context : '/api',
							host: 'www.google.com',
							proxy : {
								host : '/proxy'
							}
						};
						chai.expect(function(){
							oConfigurationValidator.validateProxyMandatoryProperties(oProxyMapping.proxy)
						}).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping.proxy,2));
					});
				});
			});
		});


		});
}());
