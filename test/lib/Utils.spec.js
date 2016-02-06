require('../bootstrap')();
//Test Global Variables:
var oUtils;
var oConfigurationManager;

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

      chai.expect(_oUtils._mProtocol['http']).to.equal(require('http'));
    });
    it("Protocol[HTTPS] should be equal to node native HTTP module",function() {
      var _oUtils = require(process.cwd()+ '/lib/Utils');

      chai.expect(_oUtils._mProtocol['https']).to.equal(require('https'));
    });
  });
});

describe("/lib.Utils.prototype - Proxy Snippet", function() {
  beforeEach(function(){
    oUtils = require(process.cwd()+ '/lib/Utils');

    oConfigurationManager = require(process.cwd()+ '/lib/core/ConfigurationManager');

  });
  it("Should have a 'getProxyMiddleware()' function that proxies requests made by the grunt-contrib-connect task",function() {
    chai.expect(typeof oUtils.getProxyMiddleware()).to.equal('function');
  });
  describe("#Proxy Logic", function() {
    var oMockGETReq = {
      url : '/testApi/testing.js',
      method: 'GET',
      headers : {
        Host : 'myServer.com'
      }
    };
    var oMockPOSTReq = {
      url : '/testApi/testing.js',
      method: 'POST',
      body : {},
      headers : {
        Host : 'myServer.com'
      }
    };
    var oMockOriginalRes = {};
    var oMockNext;
    var oMockHTTP;
    var oMockHTTPS;
    var oMockSocket = {};
    var oMockTargetResponse;

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
      };
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
      };
      oMockOriginalRes = {
        writeHead : chai.spy()
      };

      oMockTargetResponse = {
        statusCode : 200,
        pipe : chai.spy()
      };

      oConfigurationManager._mProxies = {}; //Reset Proxy configuration
      //Add mock proxy over proxy configuration
      oUtils._mProtocol['http'] = oMockHTTP;
      oUtils._mProtocol['https'] = oMockHTTPS;
    });
    describe("#Tunnel through Corporate Proxy ('CONNECT')", function() {
      describe("#Tunnel HTTP request over HTTP CorpProxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            proxyTunnel : {
              host : 'proxy',
              port : 8080
            }
          });
        });

        it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Connection
          oMockHTTP['connect']({},oMockSocket,{});
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 8080,
            method : 'CONNECT',
            path : 'myServer.com:80'
          }));
          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            socket: oMockSocket,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(2);
        });
      });
      describe("#Tunnel HTTP request over HTTPS CorpProxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            proxyTunnel : {
              host : 'proxy',
              port : 8080,
              https : true
            }
          });
        });

        it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Connection
          oMockHTTPS['connect']({},oMockSocket,{});
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 8080,
            method : 'CONNECT',
            path : 'myServer.com:80'
          }));
          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            socket: oMockSocket,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
        });
      });
      describe("#Tunnel HTTPS request over HTTPS CorpProxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true,
            proxyTunnel : {
              host : 'proxy',
              port : 8080,
              https : true
            }
          });
        });

        it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);

          //Simulate Connection
          oMockHTTPS['connect']({},oMockSocket,{});
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 8080,
            method : 'CONNECT',
            path : 'myServer.com:443'
          }));
          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 443,
            socket: oMockSocket,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(2);
        });
      });
      describe("#Tunnel HTTPS request over HTTP CorpProxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true,
            proxyTunnel : {
              host : 'proxy',
              port : 8080
            }
          });
        });

        it("Should 'CONNECT' to the given Proxy Server in order to get the Connection Socket and use it for the actual proxied call",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);

          //Simulate Connection
          oMockHTTP['connect']({},oMockSocket,{});
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 8080,
            method : 'CONNECT',
            path : 'myServer.com:443'
          }));
          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 443,
            socket: oMockSocket,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });
    });
    describe("#Simple Proxy over Proxy", function() {
      describe("#GET Proxy HTTPS 'GET' request over HTTPS Proxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true,
            proxy : {
              host : 'proxy',
              port : 44300,
              https : true
            }
          });
        });

        it("Should resolve the actual path and send it to the proxy server configured",function() {
          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 44300,
            method : 'GET',
            path : 'https://myServer.com:443/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
        });
      });
      describe("#GET Proxy HTTP 'GET' request over HTTPS Proxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            proxy : {
              host : 'proxy',
              port : 44300,
              https : true
            }
          });
        });

        it("Should resolve the actual path and send it to the proxy server configured",function() {
          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 44300,
            method : 'GET',
            path : 'http://myServer.com:80/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
        });
      });
      describe("#GET Proxy HTTPS 'GET' request over HTTP Proxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true,
            proxy : {
              host : 'proxy',
              port : 44300,
            }
          });
        });

        it("Should resolve the actual path and send it to the proxy server configured",function() {
          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 44300,
            method : 'GET',
            path : 'https://myServer.com:443/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });
      describe("#GET Proxy HTTP 'GET' request over HTTP Proxy", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            proxy : {
              host : 'proxy',
              port : 44300,
            }
          });
        });

        it("Should resolve the actual path and send it to the proxy server configured",function() {
          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 44300,
            method : 'GET',
            path : 'http://myServer.com:80/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });

    });
    describe("#Simple Proxy", function() {
      describe("#GET Proxy HTTP 'GET' request", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com'
          });
        });

        it("Should proxy the request as defined on the configuration",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });
      describe("#Proxy HTTPS 'GET' request", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true
          });
        });

        it("Should proxy the request as defined on the configuration",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 443,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              Host : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
        });
      });
      describe("#GET Proxy HTTP 'POST' request", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com'
          });
        });

        it("Should proxy the request as defined on the configuration",function() {

          oUtils.getProxyMiddleware()(oMockPOSTReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            method : 'POST',
            body : oMockPOSTReq.body,
            path : '/testApi/testing.js',
            headers : {
              'Host' : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });
      describe("#Proxy HTTPS 'POST' request", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            https : true
          });
        });

        it("Should proxy the request as defined on the configuration",function() {

          oUtils.getProxyMiddleware()(oMockPOSTReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTPS['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['https'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 443,
            method : 'POST',
            body : oMockPOSTReq.body,
            path : '/testApi/testing.js',
            headers : {
              'Host' : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTPS.end).to.have.been.called.exactly(1);
        });
      });
    });
    describe("#Ignore Proxy", function() {
      it("Should only proxy contexts that are configured - skip the others",function() {

        oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);

        chai.expect(oMockNext).to.have.been.called.exactly(1);
        chai.expect(oMockTargetResponse.pipe).to.not.have.been.called.once;
        chai.expect(oMockHTTP.end).to.not.have.been.called.once;
      });
    });
    describe("#Proxy Configuration forwarding", function() {
      describe("#Simple Proxy Configuration forwarding", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            headers : {
              'dummy' : 'header'
            }
          });
        });

        it("Should forward the given headers",function() {
          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              'dummy' : 'header',
              'Host' : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(1);
        });
      });
      describe("#Proxy through Tunnel Configuration forwarding", function() {
        beforeEach(function(){
          oConfigurationManager.addConfig({
            context : '/testApi',
            host : 'myServer.com',
            headers : {
              'dummy' : 'header'
            },
            proxyTunnel : {
              host : 'proxy',
              port : 8080,
              headers : {
                'dummy_proxy' : 'header',
                'Host' : 'myServer.com'
              },
            }
          });
        });

        it("Should forward the given headers",function() {

          oUtils.getProxyMiddleware()(oMockGETReq,oMockOriginalRes,oMockNext);

          //Simulate Connection
          oMockHTTP['connect']({},oMockSocket,{});
          //Simulate Response
          oMockHTTP['respond'](oMockTargetResponse);

          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[0][0])).to.equal(JSON.stringify({
            host : 'proxy',
            port : 8080,
            method : 'CONNECT',
            path : 'myServer.com:80',
            headers : {
              'dummy_proxy' : 'header',
              'Host' : 'myServer.com'
            }
          }));
          chai.expect(JSON.stringify(oUtils._mProtocol['http'].request.__spy.calls[1][0])).to.equal(JSON.stringify({
            host : 'myServer.com',
            port : 80,
            socket: oMockSocket,
            method : 'GET',
            path : '/testApi/testing.js',
            headers : {
              'dummy' : 'header',
              'Host' : 'myServer.com'
            }
          }));

          chai.expect(oMockNext).to.have.been.called.exactly(1);
          chai.expect(oMockTargetResponse.pipe).to.have.been.called.with(oMockOriginalRes);
          chai.expect(oMockOriginalRes.writeHead).to.have.been.called.with(200,undefined);
          chai.expect(oMockHTTP.end).to.have.been.called.exactly(2);

        });
      });
    });
  });
});
