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

      it("Should retrieve the Proxy configuration for the given URL, ignoring url parameters '?param=test'",function() {
        var sProxiedContext = '/api';
        var oProxyMapping = {
          context : sProxiedContext,
          host :  'hostserver.com',
          port : 44300,
          https : true
        };

        oConfigurationManager.addConfig(oProxyMapping);

        var sURL = sProxiedContext + '?test=true' ;
        var oProxyConfig = oConfigurationManager.getProxyConfigFromURL(sURL);

        chai.expect(oProxyConfig).to.equal(oProxyMapping);
      });
    });

  });
}());
