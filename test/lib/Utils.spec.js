require('../bootstrap')();
//Test Global Variables:
var oUtils;

describe("/lib.Utils.prototype - Inspection", function() {
    it("Should be an object",function() {
		var _oUtils = require('..\\..\\lib\\Utils');

        chai.expect(typeof _oUtils).to.equal("object");
	});
	it("Should be a singleton",function() {
		var _oUtils = require('..\\..\\lib\\Utils');
        var _oAnotherUtils = require('..\\..\\lib\\Utils');

        chai.expect(_oUtils).to.equal(_oAnotherUtils);
	});

});
describe("/lib.Utils.prototype - API", function() {
    beforeEach(function(){
        oUtils = require('..\\..\\lib\\Utils');
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
            it("Should throw an error if the 'context' property is a number",function() {
                var oProxyMapping = {
                    context : 21213,
                    host :  'hostserver.com'
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping);
                }).to.throw('Error defining Proxy. Mandatory property "context" is defined as number on: ' + JSON.stringify(oProxyMapping,2));
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
            it("Should throw an error if the 'host' property is a number",function() {
                var oProxyMapping = {
                    context : '/api',
                    host :  12321313
                };
                chai.expect(function(){
                    oUtils.addConfig(oProxyMapping)
                }).to.throw('Error defining Proxy. Mandatory property "host" is defined as number on: ' + JSON.stringify(oProxyMapping,2));
            });
        });

        it("Should receive a 'Proxy Configuration' object and store it internally, its key will be the 'proxied context'",function() {
            var sProxiedContext = '/api';
            var oProxyMapping = {
                context : sProxiedContext,
                host :  'hostserver.com'
            };

            oUtils.addConfig(oProxyMapping);

            chai.expect(oUtils._mProxies[sProxiedContext]).to.equal(oProxyMapping);
        });

        it("Should throw an error if the same context is proxied twice",function() {
            var sProxiedContext = '/api';
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
                context:'/api1',
                host:'server1.com'
            },{
                context:'/api2',
                host:'server2.com'
            }];
            oUtils.addConfigs(aConfigs);

            chai.expect(Object.keys(oUtils._mProxies).length).to.equal(2);
        });
    });


    describe("#Rewrite", function() {
        // it("Should retrieve the Proxy configuration for the given URL",function() {
        //     var sProxiedContext = '/api';
        //     var oProxyMapping = {
        //         context : sProxiedContext,
        //         host :  'hostserver.com',
        //         port : 44300,
        //         https : true
        //     };
        //
        //     oUtils.addConfig(oProxyMapping);
        //
        //     var sURL = 'localhost:9000/' + sProxiedContext + '/something/to/be/retrieved.js' ;
        //     var oProxyConfig = oUtils.getProxyConfigFromURL(sURL);
        //
        //     chai.expect(oProxyConfig).not.to.equal(undefined);
        // });
    });


});

describe("/lib.Utils.prototype - Proxy Snippet", function() {
    // it("Should have a 'proxyMiddleware' function that proxies requests",function() {
    //     var oUtils = require('..\\..\\lib\\Utils');
    //     var oAnotherUtils = require('..\\..\\lib\\Utils');
    //
    //     chai.expect(oUtils).to.equal(oAnotherUtils);
    // });
});
