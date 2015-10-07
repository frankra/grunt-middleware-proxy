require('../bootstrap')();
//Test Global Variables:
var oUtils;

describe("/lib.Utils.prototype - Inspection", function() {
    it("Should be an object",function() {
		var _oUtils = require(process.cwd()+ '/lib/Utils');

        chai.expect(typeof _oUtils).to.equal("object");
	});
	it("Should be a singleton",function() {
		var _oUtils = require(process.cwd()+ '/lib/Utils');
        var _oAnotherUtils = require(process.cwd()+ '/lib/Utils');

        chai.expect(_oUtils).to.equal(_oAnotherUtils);
	});

});
describe("/lib.Utils.prototype - API", function() {
    beforeEach(function(){
        oUtils = require(process.cwd()+ '/lib/Utils');
        oUtils._mProxies = {}; //Reset configs as this is a singleton, creating a new instance wont work...
    });

    describe("#Proxy Mapping", function() {
        it("Should have an internal map object for its proxies",function() {
            chai.expect(typeof oUtils._mProxies).to.equal("object");
        });

        describe("#Validation of mandatory fields", function() {
            it("Should throw an error if the 'context' property is missing",function() {
                var oProxyMapping = {
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Missing mandatory property "context" on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'context' property is an empty string",function() {
                var oProxyMapping = {
                    context : '',
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Mandatory property "context" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'context' property is not a string",function() {
                var oProxyMapping = {
                    context : 21213,
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Mandatory property "context" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'context' property does not start with a '/' slash",function() {
                var oProxyMapping = {
                    context : 'missingslash',
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Mandatory property "context" should start with a slash "/": ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'context' property ends with a '/' slash",function() {
                var oProxyMapping = {
                    context : '/slashatend/',
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Mandatory property "context" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'host' property is missing",function() {
                var oProxyMapping = {
                    context : '/api'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'host' property is an empty string",function() {
                var oProxyMapping = {
                    context : '/api',
                    host :  ''
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'host' property is an unsupported type",function() {
                var oProxyMapping = {
                    context : '/api',
                    host :  12321313
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'host' property ends with a slash '/'",function() {
                var oProxyMapping = {
                    context : '/api',
                    host :  'www.google.com/'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping,2));
            });
            it("Should throw an error if the 'host' property starts with a slash '/'",function() {
                var oProxyMapping = {
                    context : '/api',
                    host :  '/www.google.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping,2));
            });

            describe("#Validation of mandatory fields of 'corpProxy' configuration", function() {
                it("Should throw an error if the 'host' property is missing",function() {
                    var oProxyMapping = {
                        context : '/api',
                        host: 'www.google.com',
                        corpProxy : {
                            //missing host
                        }
                    };
                    chai.expect(function(){
                        oUtils.addConfig(oProxyMapping)
                    }).to.throw('Error defining Proxy. Missing mandatory property "host" on: ' + JSON.stringify(oProxyMapping.corpProxy,2));
                });
                it("Should throw an error if the 'host' property is an empty string",function() {
                    var oProxyMapping = {
                        context : '/api',
                        host: 'www.google.com',
                        corpProxy : {
                            host : ''
                        }
                    };
                    chai.expect(function(){
                        oUtils.addConfig(oProxyMapping)
                    }).to.throw('Error defining Proxy. Mandatory property "host" is defined as an empty string on: ' + JSON.stringify(oProxyMapping.corpProxy,2));
                });
                it("Should throw an error if the 'host' property is an unsupported type",function() {
                    var oProxyMapping = {
                        context : '/api',
                        host: 'www.google.com',
                        corpProxy : {
                            host : 111111
                        }
                    };
                    chai.expect(function(){
                        oUtils.addConfig(oProxyMapping)
                    }).to.throw('Error defining Proxy. Mandatory property "host" is defined with unsupported type number. Expects string on: ' + JSON.stringify(oProxyMapping.corpProxy,2));
                });
                it("Should throw an error if the 'host' property ends with a slash '/'",function() {
                    var oProxyMapping = {
                        context : '/api',
                        host: 'www.google.com',
                        corpProxy : {
                            host : 'proxy/'
                        }
                    };
                    chai.expect(function(){
                        oUtils.addConfig(oProxyMapping)
                    }).to.throw('Error defining Proxy. Mandatory property "host" should not end with a slash "/": ' + JSON.stringify(oProxyMapping.corpProxy,2));
                });
                it("Should throw an error if the 'host' property starts with a slash '/'",function() {
                    var oProxyMapping = {
                        context : '/api',
                        host: 'www.google.com',
                        corpProxy : {
                            host : '/proxy'
                        }
                    };
                    chai.expect(function(){
                        oUtils.addConfig(oProxyMapping)
                    }).to.throw('Error defining Proxy. Mandatory property "host" should not start with a slash "/": ' + JSON.stringify(oProxyMapping.corpProxy,2));
                });
            });
        });

        it("Should receive a 'Proxy Configuration' object and store it internally, on a tree based structure",function() {
            var sProxiedContext = '/api/to/be/proxied';
            var oProxyMapping = {
                context : sProxiedContext,
                host :  'hostserver.com'
            };

            oUtils.addConfig(oProxyMapping);

            chai.expect(oUtils._mProxies.api.to.be.proxied.__CONFIG__).to.equal(oProxyMapping);
        });

        it("Should throw an error if the same context is proxied twice",function() {
            var sProxiedContext = '/api/to/be/proxied';
            var oProxyMapping = {
                context : sProxiedContext,
                host :  'hostserver.com',
                port : 44300,
                https : true
            };

            oUtils.addConfig(oProxyMapping);

            chai.expect(function(){
                oUtils.addConfig(oProxyMapping);
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
            oUtils.addConfigs(aConfigs);

            chai.expect(oUtils._mProxies.api.endpoint1.__CONFIG__).to.equal(aConfigs[0]);
            chai.expect(oUtils._mProxies.api.endpoint2.__CONFIG__).to.equal(aConfigs[1]);
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

            oUtils.addConfig(oProxyMapping);

            var sURL = 'localhost:9000' + sProxiedContext + '/something/to/be/retrieved.js' ;
            var oProxyConfig = oUtils.getProxyConfigFromURL(sURL);

            chai.expect(oProxyConfig).to.equal(oProxyMapping);
        });
    });

});

describe("/lib.Utils.prototype - Proxy Snippet", function() {
    beforeEach(function(){
        oUtils = require(process.cwd()+ '/lib/Utils');
    });
    it("Should have a 'proxyMiddleware' function that proxies requests made by the grunt-contrib-connect task",function() {
        chai.expect(typeof oUtils.proxyMiddleware).to.equal('function');
    });
    describe("/lib.Utils.prototype - HTTP Proxy through HTTP Proxy (Corporate Proxy)", function() {
        beforeEach(function(){
            oUtils._mProxies = {}; //Reset Proxy configuration
            //Add mock proxy over proxy configuration
            oUtils.addConfig({
                context : '/testApi',
                host : 'myServer.com',
                corpProxy : {
                    host : 'proxy',
                    port : '8080'
                },
            })
        });
        it("Should have a 'proxyMiddleware' function that proxies requests made by the grunt-contrib-connect task",function() {
            chai.expect(typeof oUtils.proxyMiddleware).to.equal('function');
        });

    });
});
