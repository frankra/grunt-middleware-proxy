require('../bootstrap')();
//Test Global Variables:
var oUtils = require(process.cwd()+ '/lib/Utils');;
var oConfigurationManager = require(process.cwd()+ '/lib/core/ConfigurationManager');
var oProxyHandler = require(process.cwd()+ '/lib/core/ProxyHandler');

//Mock Data
var mMockConfig;
var mockReq;
var mockRes;
var mockNext;


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

describe("/lib.Utils.prototype - Proxy Snippet", function() {
  it("Should have a 'getProxyMiddleware()' function that proxies requests made by the grunt-contrib-connect task",function() {
    chai.expect(typeof oUtils.getProxyMiddleware()).to.equal('function');
  });

  describe("/lib.Utils.prototype - Proxy Snippet Routing based on grunt configuration", function() {
    describe("/lib.Utils.prototype - Simple Proxy", function() {
      beforeEach(function(){
        mMockConfig = {
          context: '/test',
          host: 'test'
        }; //Simple Config

        mockReq = {url:'/test'};
        mockNext = chai.spy();

        oConfigurationManager.getProxyConfigFromURL = chai.spy(function(){
          return mMockConfig;
        });
        oProxyHandler.proxyRequest = chai.spy();
        oProxyHandler.proxyTunneling = chai.spy();
        oProxyHandler.proxyThroughProxy = chai.spy();
      });
      afterEach(function(){
        oConfigurationManager._mProxies = {}; //Reset Proxies
      });

      it("Should route the configuration to the 'proxyRequest' function of the ProxyHandler class",function() {
        oUtils.getProxyMiddleware()(mockReq,mockRes,mockNext);

        chai.expect(oProxyHandler.proxyRequest).to.have.been.called.exactly(1);
        chai.expect(oProxyHandler.proxyRequest).to.have.been.called.with(mMockConfig,mockReq,mockRes);

        chai.expect(oProxyHandler.proxyTunneling).to.have.been.called.exactly(0);
        chai.expect(oProxyHandler.proxyThroughProxy).to.have.been.called.exactly(0);

        chai.expect(mockNext).to.have.been.called.exactly(0);
      });
    });

    describe("/lib.Utils.prototype - Proxy through proxy", function() {
      beforeEach(function(){
        mMockConfig = {
          context: '/test',
          host: 'test',
          proxy: {
            context: '/test',
            host: 'test'
          }
        };

        mockReq = {url:'/test'};
        mockNext = chai.spy();

        oConfigurationManager.getProxyConfigFromURL = chai.spy(function(){
          return mMockConfig;
        });
        oProxyHandler.proxyRequest = chai.spy();
        oProxyHandler.proxyTunneling = chai.spy();
        oProxyHandler.proxyThroughProxy = chai.spy();
      });
      afterEach(function(){
        oConfigurationManager._mProxies = {}; //Reset Proxies
      });

      it("Should route the configuration to the 'proxyThroughProxy' function of the ProxyHandler class",function() {
        oUtils.getProxyMiddleware()(mockReq,mockRes,mockNext);

        chai.expect(oProxyHandler.proxyThroughProxy).to.have.been.called.exactly(1);
        chai.expect(oProxyHandler.proxyThroughProxy).to.have.been.called.with(mMockConfig,mockReq,mockRes);

        chai.expect(oProxyHandler.proxyTunneling).to.have.been.called.exactly(0);
        chai.expect(oProxyHandler.proxyRequest).to.have.been.called.exactly(0);

        chai.expect(mockNext).to.have.been.called.exactly(0);
      });

    });

    describe("/lib.Utils.prototype - Proxy tunneling", function() {
      beforeEach(function(){
        mMockConfig = {
          context: '/test',
          host: 'test',
          proxyTunnel: {
            context: '/test',
            host: 'test'
          }
        };

        mockReq = {url:'/test'};
        mockNext = chai.spy();

        oConfigurationManager.getProxyConfigFromURL = chai.spy(function(){
          return mMockConfig;
        });
        oProxyHandler.proxyRequest = chai.spy();
        oProxyHandler.proxyTunneling = chai.spy();
        oProxyHandler.proxyThroughProxy = chai.spy();
      });
      afterEach(function(){
        oConfigurationManager._mProxies = {}; //Reset Proxies
      });

      it("Should route the configuration to the 'proxyThroughProxy' function of the ProxyHandler class",function() {
        oUtils.getProxyMiddleware()(mockReq,mockRes,mockNext);

        chai.expect(oProxyHandler.proxyTunneling).to.have.been.called.exactly(1);
        chai.expect(oProxyHandler.proxyTunneling).to.have.been.called.with(mMockConfig,mockReq,mockRes);

        chai.expect(oProxyHandler.proxyThroughProxy).to.have.been.called.exactly(0);
        chai.expect(oProxyHandler.proxyRequest).to.have.been.called.exactly(0);

        chai.expect(mockNext).to.have.been.called.exactly(0);
      });

    });

    describe("/lib.Utils.prototype - No match - Configuration not found for URL", function() {
      beforeEach(function(){
        mMockConfig = null;

        mockReq = {url:'/test'};
        mockNext = chai.spy();

        oConfigurationManager.getProxyConfigFromURL = chai.spy(function(){
          return mMockConfig;
        });
        oProxyHandler.proxyRequest = chai.spy();
        oProxyHandler.proxyTunneling = chai.spy();
        oProxyHandler.proxyThroughProxy = chai.spy();
      });
      afterEach(function(){
        oConfigurationManager._mProxies = {}; //Reset Proxies
      });

      it("Should route the configuration to the 'proxyThroughProxy' function of the ProxyHandler class",function() {
        oUtils.getProxyMiddleware()(mockReq,mockRes,mockNext);

        chai.expect(oProxyHandler.proxyTunneling).to.have.been.called.exactly(0);
        chai.expect(oProxyHandler.proxyThroughProxy).to.have.been.called.exactly(0);
        chai.expect(oProxyHandler.proxyRequest).to.have.been.called.exactly(0);

        chai.expect(mockNext).to.have.been.called.exactly(1);
      });

    });

  });
});
