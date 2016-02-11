(function(){
    'use strict';

    var oConfigurationManager = require('./core/ConfigurationManager.js');
    var oProxyHandler = require('./core/ProxyHandler.js');

    function Utils(){};

    Utils.prototype._proxyMiddleware = function(req,res,next){
        var oConfig = oConfigurationManager.getProxyConfigFromURL(req.url);
        if (oConfig){
            var fnProxyHandler;
            if (oConfig.proxyTunnel){
                fnProxyHandler = oProxyHandler.proxyTunneling;
            }else if (oConfig.proxy){
                fnProxyHandler = oProxyHandler.proxyThroughProxy;
            }else {
                fnProxyHandler = oProxyHandler.proxyRequest;
            };

            fnProxyHandler.bind(oProxyHandler)(
              oConfig,
              req,
              res
            );
        }else {
            next();
        }
    };

    Utils.prototype.getProxyMiddleware = function(){
        return this._proxyMiddleware.bind(this);
    };
    module.exports = new Utils();
}())
