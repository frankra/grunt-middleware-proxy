(function(){
    'use strict';

    var DEFAULT_HTTPS_PORT = 443;
    var DEFAULT_HTTP_PORT = 80;
    function Utils(){
        this._mProxies = {};
        this._mProtocol = {
            'http' : require('http'),
            'https' : require('https')
        };
    };

    var mDefaultErrorMessages = { //TODO: i18n model or something would be nice ;)
        'missing' : 'Error defining Proxy. Missing mandatory property "$1" on: ',
        'empty' : 'Error defining Proxy. Mandatory property "$1" is defined as an empty string on: ',
        'unsupportedType' : 'Error defining Proxy. Mandatory property "$1" is defined with unsupported type $2. Expects $3 on: ',
        'slashAtEnd' : 'Error defining Proxy. Mandatory property "$1" should not end with a slash "/": ',
        'slashAtBegin' : 'Error defining Proxy. Mandatory property "$1" should not start with a slash "/": ',
        'missingSlashAtBegin' : 'Error defining Proxy. Mandatory property "$1" should start with a slash "/": '
    }

    var mDefaultConfigTypeValidation = {
        context: {
            type : 'string',
            customValidations : [
                function(sKey,sContext,oProxyConfig){
                    if (sContext.substring(0,1) !== '/'){
                        throwValidationError('missingSlashAtBegin',[sKey],oProxyConfig);
                    }
                },
                function(sKey,sContext,oProxyConfig){
                    if (sContext.substr(sContext.length-1) === '/'){
                        throwValidationError('slashAtEnd',[sKey],oProxyConfig);
                    }
                }
            ]
        },
        host : {
            type : 'string',
            customValidations : [
                function(sKey,sHost,oProxyConfig){
                    if (sHost.substring(0,1) === '/'){
                        throwValidationError('slashAtBegin',[sKey],oProxyConfig);
                    }
                },
                function(sKey,sContext,oProxyConfig){
                    if (sContext.substr(sContext.length-1) === '/'){
                        throwValidationError('slashAtEnd',[sKey],oProxyConfig);
                    }
                }
            ]
        }
    };

    var mProxyTunnelTypeValidation = {
        host : {
            type : 'string',
            customValidations : [
                function(sKey,sHost,oProxyConfig){
                    if (sHost.substring(0,1) === '/'){
                        throwValidationError('slashAtBegin',[sKey],oProxyConfig);
                    }
                },
                function(sKey,sContext,oProxyConfig){
                    if (sContext.substr(sContext.length-1) === '/'){
                        throwValidationError('slashAtEnd',[sKey],oProxyConfig);
                    }
                }
            ]
        }
    };
    var mProxyTypeValidation = {
        host : {
            type : 'string',
            customValidations : [
                function(sKey,sHost,oProxyConfig){
                    if (sHost.substring(0,1) === '/'){
                        throwValidationError('slashAtBegin',[sKey],oProxyConfig);
                    }
                },
                function(sKey,sContext,oProxyConfig){
                    if (sContext.substr(sContext.length-1) === '/'){
                        throwValidationError('slashAtEnd',[sKey],oProxyConfig);
                    }
                }
            ]
        }
    };

    function throwValidationError(sType, aPlaceholders, oErroneousConfiguration){
        var sMessage = mDefaultErrorMessages[sType];
        aPlaceholders.forEach(function(sText,iIndex){
            sMessage = sMessage.replace(('$' + (iIndex+1).toString()),sText);
        });

        throw new Error(sMessage + JSON.stringify(oErroneousConfiguration,2));
    };

    function validateMandatoryProperties(mValidationConfig,oProxyConfig){
        Object.keys(mValidationConfig).forEach(function(sKey){
            if (oProxyConfig.hasOwnProperty(sKey)){
                if (typeof oProxyConfig[sKey] === mValidationConfig[sKey].type){
                    if (oProxyConfig[sKey] === ''){
                        throwValidationError(
                            'empty',
                            [sKey],
                            oProxyConfig
                        );
                    }
                }else {
                    throwValidationError(
                        'unsupportedType',
                        [sKey,typeof oProxyConfig[sKey],mValidationConfig[sKey].type],
                        oProxyConfig
                    );
                }
                mValidationConfig[sKey].customValidations.forEach(function(fnValidation){
                    fnValidation(sKey,oProxyConfig[sKey],oProxyConfig);
                });
            }else {
                throwValidationError(
                    'missing',
                    [sKey],
                    oProxyConfig
                );
            }
        });
    };


    Utils.prototype.addConfig = function(oProxyConfig){
        validateMandatoryProperties(mDefaultConfigTypeValidation,oProxyConfig);
        if (oProxyConfig.proxyTunnel){
            validateMandatoryProperties(mProxyTunnelTypeValidation,oProxyConfig.proxyTunnel);
        }else if(oProxyConfig.proxy){
            validateMandatoryProperties(mProxyTypeValidation,oProxyConfig.proxy);
        }

        var sProxiedContext = oProxyConfig.context;
        var aProxiedContextParts = sProxiedContext.split('/');
        aProxiedContextParts.shift(); //Remove first item, as it is an empty string
        
        this._addConfigToTree(this._mProxies,aProxiedContextParts,oProxyConfig);
    };

    Utils.prototype._addConfigToTree = function(oNavigator,aProxiedContextParts,oProxyConfig){
    	var sPart = aProxiedContextParts.shift();//splice(0,1)[0];
    	if (sPart){
    		if (!oNavigator.hasOwnProperty(sPart)){
    			oNavigator = oNavigator[sPart] = {};
    		}else {
    			oNavigator = oNavigator[sPart];
    		}
    		this._addConfigToTree(oNavigator,aProxiedContextParts,oProxyConfig);
    	}else {
            if (oNavigator.__CONFIG__){
                throw new Error('Context ' + oProxyConfig.context + ' proxied twice! Check your configuration.');
            }else {
                oNavigator.__CONFIG__ = oProxyConfig; //This weird '__CONFIG__' attribute is here to prevent overriding of configurations
            }
    	};
    };

    Utils.prototype._getConfigFromTree = function(oNavigator,aProxiedContextParts){
    	var sPart = aProxiedContextParts.shift();
    	if (sPart && oNavigator.hasOwnProperty(sPart)){
    		oNavigator = oNavigator[sPart];
    		return this._getConfigFromTree(oNavigator,aProxiedContextParts);
    	}else {
    		return oNavigator.__CONFIG__;
    	}
    };

    Utils.prototype.addConfigs = function(aConfigs){
        aConfigs.forEach(function(oConfig){
            this.addConfig(oConfig);
        }.bind(this));
    };

    Utils.prototype.getProxyConfigFromURL = function(sURL){
        var aURLParts = sURL.split('/');
        aURLParts.shift(); //Remove 'empty string'
        var aContext = aURLParts;
        return this._getConfigFromTree(this._mProxies,aContext);
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
                headers : oConfig.headers
            }, function (oConnectionResponse) {
                oConnectionResponse.pipe(res);
                next();
            }).end();
        }).end();
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
            headers : oConfig.headers
        }, function (oResponse) {
            oResponse.pipe(res);
            next();
        }).end();
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
            headers : oConfig.headers
        }, function (oResponse) {
            oResponse.pipe(res);
            next();
        }).end();
    };

    Utils.prototype._proxyMiddleware = function(req,res,next){
        var oConfig = this.getProxyConfigFromURL(req.url);
        if (oConfig){
            if (oConfig.proxyTunnel){
                this._handleProxyTunneling(
                    oConfig,
                    req,
                    res,
                    next
                )
            }else if(oConfig.proxy){
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
