(function(){
    'use strict';

    var oConfigurationManager = require('./core/ConfigurationManager.js');

    var DEFAULT_HTTPS_PORT = 443;
    var DEFAULT_HTTP_PORT = 80;
    function Utils(){
        this._mProxies = {};
        this._mProtocol = {
            'http' : require('http'),
            'https' : require('https')
        };
    };

    Utils.prototype._prepareHeadersToBeForwarded = function(sHost, oConfigHeaders, oReqHeaders){
        if (!oConfigHeaders){
          oConfigHeaders = {};
        };

        Object.keys(oReqHeaders).forEach(function(sProperty){
            if (sProperty.match(/host/i)){ //Fix HOST
              oConfigHeaders[sProperty] = sHost;
              return;
            }
            oConfigHeaders[sProperty] = oReqHeaders[sProperty];
        });
        return oConfigHeaders;
    };

    Utils.prototype._handleProxyTunneling = function(oConfig,req,res,next){
        var oProxyTunnelConfig = oConfig.proxyTunnel;
        var sTunnelProtocol = this._resolveProtocolFromConfig(oProxyTunnelConfig);
        var oTunnelConnector = this._resolveConnectorForProtocol(sTunnelProtocol);
        var sProxyProtocol = this._resolveProtocolFromConfig(oConfig);
        var oProxyConnector = this._resolveConnectorForProtocol(sProxyProtocol);
        var iTunnelPort = this._resolvePortFromConfig(oProxyTunnelConfig);
        var iProxyPort = this._resolvePortFromConfig(oConfig);
        var sAuthData = req.auth ? req.auth : oConfig.auth;

        oTunnelConnector.request({
            host : oProxyTunnelConfig.host,
            port : iTunnelPort,
            method : 'CONNECT',
            path : oConfig.host + ':' + iProxyPort,
            headers : oProxyTunnelConfig.headers
        }).on('connect', function(oProxyResponse, oSocket, oHead) {
            oProxyConnector.request({
                host: oConfig.host,
                port: iProxyPort,
                socket: oSocket,
                method : req.method,
                body : req.body,
                path : req.url,
                auth : sAuthData,
                headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
            }, function (oResponse) {
                this._pipeResponseBackToOriginalRes(oResponse,res);
                next();
            }.bind(this)).end();
        }.bind(this)).end();
    };

    Utils.prototype._resolveProtocolFromConfig = function(oConfig){
        return oConfig.https ? 'https' : 'http';
    };
    Utils.prototype._resolvePortFromConfig = function(oConfig){
        return oConfig.port ? oConfig.port : oConfig.https ? DEFAULT_HTTPS_PORT : DEFAULT_HTTP_PORT;
    };
    Utils.prototype._resolveConnectorForProtocol = function(sHttpOrHttps){
        return this._mProtocol[sHttpOrHttps];
    };

    Utils.prototype._pipeResponseBackToOriginalRes = function(oProxyRes, oOriginalRes){
        //Workaround - This should be fixed, maybe with the commented code below..
        oOriginalRes.writeHead(oProxyRes.statusCode,oProxyRes.headers);
        oProxyRes.pipe(oOriginalRes);
        /*
        oProxyRes.on('data',function(oChunk){
          oOriginalRes.write("" + oChunk);
        });
        oProxyRes.on('end',function(){
          oOriginalRes.end();
        });*/
    };

    Utils.prototype._handleProxyThroughProxy = function(oConfig,req,res,next){
        var oProxyConfig = oConfig.proxy;
        var sProxyProtocol = this._resolveProtocolFromConfig(oProxyConfig);
        var oProxyConnector = this._resolveConnectorForProtocol(sProxyProtocol);
        var iProxyPort = this._resolvePortFromConfig(oProxyConfig);

        var sPathProtocol = this._resolveProtocolFromConfig(oConfig);
        var iPathPort = this._resolvePortFromConfig(oConfig);

        oProxyConnector.request({
            host: oProxyConfig.host,
            port: iProxyPort,
            method: req.method,
            body : req.body,
            path: sPathProtocol + '://' + oConfig.host + ':' + iPathPort + req.url,
            headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
        }, function (oResponse) {
            this._pipeResponseBackToOriginalRes(oResponse,res);
            next();
        }.bind(this)).end();
    };

    Utils.prototype._proxyRequest = function(oConfig,req,res,next){
        var sProxyProtocol = this._resolveProtocolFromConfig(oConfig);
        var oProxyConnector = this._resolveConnectorForProtocol(sProxyProtocol);
        var iProxyPort = this._resolvePortFromConfig(oConfig);
        var sAuthData = req.auth ? req.auth : oConfig.auth;

        oProxyConnector.request({
            host: oConfig.host,
            port: iProxyPort,
            method: req.method,
            body : req.body,
            path: req.url,
            auth : sAuthData,
            headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
        }, function (oResponse) {

            this._pipeResponseBackToOriginalRes(oResponse,res);
            next();
        }.bind(this)).end();
    };

    Utils.prototype._proxyMiddleware = function(req,res,next){
        var oConfig = oConfigurationManager.getProxyConfigFromURL(req.url);
        if (oConfig){
            if (oConfig.proxyTunnel){
                this._handleProxyTunneling(
                    oConfig,
                    req,
                    res,
                    next
                )
            }else if (oConfig.proxy){
                this._handleProxyThroughProxy(
                    oConfig,
                    req,
                    res,
                    next
                )
            }else {
                this._proxyRequest(
                    oConfig,
                    req,
                    res,
                    next
                )
            };
        }else {
            next();
        }
    };

    Utils.prototype.getProxyMiddleware = function(){
        return this._proxyMiddleware.bind(this);
    };
    module.exports = new Utils();
}())
