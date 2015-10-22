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
    describe("#Internal Dependencies", function() {
        it("Should have a map for the supported protocols",function() {
    		var _oUtils = require(process.cwd()+ '/lib/Utils');

            chai.expect(typeof _oUtils._mProtocol).to.equal("object");
    	});
        it("Protocol[HTTP] should be equal to node native HTTP module",function() {
    		var _oUtils = require(process.cwd()+ '/lib/Utils');

            chai.expect(_oUtils._mProtocol['HTTP']).to.equal(require('http'));
    	});
        it("Protocol[HTTPS] should be equal to node native HTTP module",function() {
    		var _oUtils = require(process.cwd()+ '/lib/Utils');

            chai.expect(_oUtils._mProtocol['HTTPS']).to.equal(require('https'));
    	});
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

            var sURL = sProxiedContext + '/something/to/be/retrieved.js' ;
            var oProxyConfig = oUtils.getProxyConfigFromURL(sURL);

            chai.expect(oProxyConfig).to.equal(oProxyMapping);
        });
    });

});

describe("/lib.Utils.prototype - Proxy Snippet", function() {
    beforeEach(function(){
        oUtils = require(process.cwd()+ '/lib/Utils');
    });
    it("Should have a 'getProxyMiddleware()' function that proxies requests made by the grunt-contrib-connect task",function() {
        chai.expect(typeof oUtils.getProxyMiddleware()).to.equal('function');
    });
    describe("#Proxy Logic", function() {
        var oMockGETReq = {
            url : '/testApi/testing.js',
            method: 'GET'
        };
        var oMockPOSTReq = {
            url : '/testApi/testing.js',
            method: 'POST',
            body : {}
        };
        var oMockRes = {};
        var oMockNext;
        var oMockHTTP;
        var oMockHTTPS;
        var oMockSocket = {};
        var oMockResponse;

        beforeEach(function(){
            oMockNext = chai.spy(); //Reset Chai spy

            oMockHTTP = {
                request : chai.spy(function(oConfig,fnRespond){
                    oMockHTTP['respond'] = fnRespond;
                    return oMockHTTP;
                }),
                on : chai.spy(function(sEventName,fnOn){
                    oMockHTTP[sEventName] = fnOn;
                    return oMockHTTP;
                }),
                end : chai.spy()
            }
            oMockHTTPS = {
                request : chai.spy(function(oConfig,fnRespond){
                    oMockHTTPS['respond'] = fnRespond;
                    return oMockHTTPS;
                }),
                on : chai.spy(function(sEventName,fnOn){
                    oMockHTTPS[sEventName] = fnOn;
                    return oMockHTTPS;
                }),
                end : chai.spy()
            }
            oMockResponse = {
                pipe: chai.spy()
            };

            oUtils._mProxies = {}; //Reset Proxy configuration
            //Add mock proxy over proxy configuration
            oUtils._mProtocol['HTTP'] = oMockHTTP;
            oUtils._mProtocol['HTTPS'] = oMockHTTPS;
        });
        describe("#Tunnel through Corporate Proxy ('CONNECT')", function() {
            describe("#Tunnel HTTP request over HTTP CorpProxy", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        corpProxy : {
                            host : 'proxy',
                            port : 8080
                        }
                    });
                });

                it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);
                    //Simulate Connection
                    oMockHTTP['connect']({},oMockSocket,{});
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'proxy',
                        port : 8080,
                        method : 'CONNECT',
                        path : 'myServer.com:80'
                    }));
                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        agent: false,
                        socket: oMockSocket,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(2);
                });
            });
            describe("#Tunnel HTTP request over HTTPS CorpProxy", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        corpProxy : {
                            host : 'proxy',
                            port : 8080,
                            https : true
                        }
                    });
                });

                it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);
                    //Simulate Connection
                    oMockHTTPS['connect']({},oMockSocket,{});
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'proxy',
                        port : 8080,
                        method : 'CONNECT',
                        path : 'myServer.com:80'
                    }));
                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        agent: false,
                        socket: oMockSocket,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
                    chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
                });
            });
            describe("#Tunnel HTTPS request over HTTPS CorpProxy", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        https : true,
                        corpProxy : {
                            host : 'proxy',
                            port : 8080,
                            https : true
                        }
                    });
                });

                it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);

                    //Simulate Connection
                    oMockHTTPS['connect']({},oMockSocket,{});
                    //Simulate Response
                    oMockHTTPS['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'proxy',
                        port : 8080,
                        method : 'CONNECT',
                        path : 'myServer.com:443'
                    }));
                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 443,
                        agent: false,
                        socket: oMockSocket,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTPS.end).to.have.been.called.exactly(2);
                });
            });
            describe("#Tunnel HTTPS request over HTTP CorpProxy", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        https : true,
                        corpProxy : {
                            host : 'proxy',
                            port : 8080
                        }
                    });
                });

                it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);

                    //Simulate Connection
                    oMockHTTP['connect']({},oMockSocket,{});
                    //Simulate Response
                    oMockHTTPS['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'proxy',
                        port : 8080,
                        method : 'CONNECT',
                        path : 'myServer.com:443'
                    }));
                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 443,
                        agent: false,
                        socket: oMockSocket,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
                });
            });
        });
        describe("#Simple Proxy", function() {
            describe("#GET Proxy HTTP 'GET' request", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com'
                    });
                });

                it("Should proxy the request as defined on the configuration",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
                });
            });
            describe("#Proxy HTTPS 'GET' request", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        https : true
                    });
                });

                it("Should proxy the request as defined on the configuration",function() {

                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);
                    //Simulate Response
                    oMockHTTPS['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 443,
                        method : 'GET',
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
                });
            });
            describe("#GET Proxy HTTP 'POST' request", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com'
                    });
                });

                it("Should proxy the request as defined on the configuration",function() {

                    oUtils.getProxyMiddleware()(oMockPOSTReq,oMockRes,oMockNext);
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        method : 'POST',
                        body : oMockPOSTReq.body,
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
                });
            });
            describe("#Proxy HTTPS 'POST' request", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        https : true
                    });
                });

                it("Should proxy the request as defined on the configuration",function() {

                    oUtils.getProxyMiddleware()(oMockPOSTReq,oMockRes,oMockNext);
                    //Simulate Response
                    oMockHTTPS['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTPS'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 443,
                        method : 'POST',
                        body : oMockPOSTReq.body,
                        path : '/testApi/testing.js'
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
                });
            });
        });
        describe("#Ignore Proxy", function() {
            it("Should only proxy contexts that are configured - skip the others",function() {

                oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);

                chai.expect(oMockNext).to.have.been.called.exactly(1);
                chai.expect(oMockResponse.pipe).to.not.have.been.called.once;
                chai.expect(oMockHTTP.end).to.not.have.been.called.once;
            });
        });
        describe("#Proxy Configuration forwarding", function() {
            describe("#Simple Proxy Configuration forwarding", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        headers : {
                            'dummy' : 'header'
                        }
                    });
                });

                it("Should forward the given headers",function() {
                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        method : 'GET',
                        path : '/testApi/testing.js',
                        headers : {
                            'dummy' : 'header'
                        }
                    }));

                    chai.expect(oMockNext).to.have.been.called.exactly(1);
                    chai.expect(oMockResponse.pipe).to.have.been.called.with(oMockRes);
                    chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
                });
            });
            describe("#Proxy over through Tunnel Configuration forwarding", function() {
                beforeEach(function(){
                    oUtils.addConfig({
                        context : '/testApi',
                        host : 'myServer.com',
                        headers : {
                            'dummy' : 'header'
                        },
                        corpProxy : {
                            host : 'proxy',
                            port : 8080,
                            headers : {
                                'dummy_proxy' : 'header'
                            },
                        }
                    });
                });

                it("Should forward the given headers",function() {
                   
                    oUtils.getProxyMiddleware()(oMockGETReq,oMockRes,oMockNext);

                    //Simulate Connection
                    oMockHTTP['connect']({},oMockSocket,{});
                    //Simulate Response
                    oMockHTTP['respond'](oMockResponse);

                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
                        host : 'proxy',
                        port : 8080,
                        method : 'CONNECT',
                        path : 'myServer.com:80',
                        headers : {
                            'dummy_proxy' : 'header'
                        }
                    }));
                    chai.expect(JSON.stringify(oUtils._mProtocol['HTTP'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
                        host : 'myServer.com',
                        port : 80,
                        agent: false,
                        socket: oMockSocket,
                        method : 'GET',
                        path : '/testApi/testing.js',
                        headers : {
                            'dummy' : 'header'
                        }
                    }));

                });
            });
        });
    });
});
