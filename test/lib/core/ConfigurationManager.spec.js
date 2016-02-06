(function(){
	"use strict";

	require('../../bootstrap')();
	//Test Global Variables:
	var oConfigurationManager;


	describe("/lib.core.ConfigurationManager.prototype - Inspection", function() {
		it("Should be an object",function() {
			var _oConfigurationManager = require(process.cwd()+ '/lib/core/ConfigurationManager');

			chai.expect(typeof _oConfigurationManager).to.equal("object");
		});
		it("Should be a singleton",function() {
			var _oConfigurationManager = require(process.cwd()+ '/lib/core/ConfigurationManager');
			var _oAnotherUtils = require(process.cwd()+ '/lib/core/ConfigurationManager');

			chai.expect(_oConfigurationManager).to.equal(_oAnotherUtils);
		});
		describe("#Internal Dependencies", function() {
			it("Should have a map property to store the configurations",function() {
				var _oConfigurationManager = require(process.cwd()+ '/lib/core/ConfigurationManager');

				chai.expect(typeof _oConfigurationManager._mProxies).to.equal("object");
			});
		});
	});

	describe("/lib.core.ConfigurationManager.prototype - ConfigurationManager", function() {
		beforeEach(function(){
			oConfigurationManager = require(process.cwd() + '/lib/core/ConfigurationManager.js');
			oConfigurationManager._mProxies = {}; //Reset configs as this is a singleton, creating a new instance wont work...
		});

		describe("#Proxy Mapping", function() {

			describe("#Validation of mandatory fields", function() {
				it("Should throw an error if the 'context' property is missing",function() {
					var oProxyMapping = {
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping);
					}).to.throw('Error defining Proxy. Missing mandatory property "context" on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property is an empty string",function() {
					var oProxyMapping = {
						context : '',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property is not a string",function() {
					var oProxyMapping = {
						context : 21213,
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property does not start with a '/' slash",function() {
					var oProxyMapping = {
						context : 'missingslash',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" should start with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'context' property ends with a '/' slash",function() {
					var oProxyMapping = {
						context : '/slashatend/',
						host :  'hostserver.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping);
					}).to.throw('Error defining Proxy. Mandatory property "context" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is missing",function() {
					var oProxyMapping = {
						context : '/api'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping)
					}).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is an empty string",function() {
					var oProxyMapping = {
						context : '/api',
						host :  ''
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property is an unsupported type",function() {
					var oProxyMapping = {
						context : '/api',
						host :  12321313
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property ends with a slash '/'",function() {
					var oProxyMapping = {
						context : '/api',
						host :  'www.google.com/'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping)
					}).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
				});
				it("Should throw an error if the 'host' property starts with a slash '/'",function() {
					var oProxyMapping = {
						context : '/api',
						host :  '/www.google.com'
					};
					chai.expect(function(){
						oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
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
							oConfigurationManager.addConfig(oProxyMapping)
						}).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping.proxy,2));
					});
				});
			});

			it("Should receive a 'Proxy Configuration' object and store it internally, on a tree based structure",function() {
				var sProxiedContext = '/api/to/be/proxied';
				var oProxyMapping = {
					context : sProxiedContext,
					host :  'hostserver.com'
				};

				oConfigurationManager.addConfig(oProxyMapping);

				chai.expect(oConfigurationManager._mProxies.api.to.be.proxied.__CONFIG__).to.equal(oProxyMapping);
			});

			it("Should throw an error if the same context is proxied twice",function() {
				var sProxiedContext = '/api/to/be/proxied';
				var oProxyMapping = {
					context : sProxiedContext,
					host :  'hostserver.com',
					port : 44300,
					https : true
				};

				oConfigurationManager.addConfig(oProxyMapping);

				chai.expect(function(){
					oConfigurationManager.addConfig(oProxyMapping);
				}).to.throw('Context ' + sProxiedContext + ' proxied twice! Check your configuration.');
			});
		});

		describe("#Add multiple configurations (Grunt)", function() {
			it("Should receive the Array of proxy configurations and store it internally",function() {
				var aConfigs = [{
					context:'/api/endpoint1',
					host:'server1.com'
				},{
					context:'/api/endpoint2',
					host:'server2.com'
				}];
				oConfigurationManager.addConfigs(aConfigs);

				chai.expect(oConfigurationManager._mProxies.api.endpoint1.__CONFIG__).to.equal(aConfigs[0]);
				chai.expect(oConfigurationManager._mProxies.api.endpoint2.__CONFIG__).to.equal(aConfigs[1]);
			});
		});

		describe("#Rewrite", function() {
			it("Should retrieve the Proxy configuration for the given URL",function() {
				var sProxiedContext = '/api';
				var oProxyMapping = {
					context : sProxiedContext,
					host :  'hostserver.com',
					port : 44300,
					https : true
				};

				oConfigurationManager.addConfig(oProxyMapping);

				var sURL = sProxiedContext + '/something/to/be/retrieved.js' ;
				var oProxyConfig = oConfigurationManager.getProxyConfigFromURL(sURL);

				chai.expect(oProxyConfig).to.equal(oProxyMapping);
			});
		});

	});
}());
