(function(){
    'use strict';

    function Utils(){
        this._mProxies = {};
        this._mProtocol = {
            'HTTP' : require('http'),
            'HTTPS' : require('https')
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

    var mCorpProxyTypeValidation = {
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
        if (oProxyConfig.corpProxy){
            validateMandatoryProperties(mCorpProxyTypeValidation,oProxyConfig.corpProxy);
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

    Utils.prototype._handleProxyThroughCorporateProxy = function(oConfig,req,res,next){
        var oCorpProxyConfig = oConfig.corpProxy;
        var oCorpProxyConnector = this._mProtocol[oCorpProxyConfig.https ? 'HTTPS' : 'HTTP'];
        var oProxyConnector = this._mProtocol[oConfig.https ? 'HTTPS' : 'HTTP'];
        var iCorpProxyPort = oCorpProxyConfig.port ? oCorpProxyConfig.port : oCorpProxyConfig.https ? 443 : 80;
        var iProxyPort = oConfig.port ? oConfig.port : oConfig.https ? 443 : 80;

        oCorpProxyConnector.request({
            host : oCorpProxyConfig.host,
            port : iCorpProxyPort,
            method : 'CONNECT',
            path : oConfig.host + ':' + iProxyPort
        }).on('connect', function(oProxyResponse, oSocket, oHead) {
            oProxyConnector.request({
                host: oConfig.host,
                port: iProxyPort,
                agent : false,
                socket: oSocket,
                method : req.method,
                body : req.body,
                path : req.url
            }, function (oConnectionResponse) {
                oConnectionResponse.pipe(res);
                next();
            }).end();
        }).end();
    };

    Utils.prototype._proxyRequest = function(oConfig,req,res,next){
        var oProxyConnector = this._mProtocol[oConfig.https ? 'HTTPS' : 'HTTP'];
        var iProxyPort = oConfig.port ? oConfig.port : oConfig.https ? 443 : 80;

        oProxyConnector.request({
            host: oConfig.host,
            port: iProxyPort,
            method: req.method,
            body : req.body,
            path: req.url,
        }, function (oResponse) {
            oResponse.pipe(res);
            next();
        }).end();
    };

    Utils.prototype.proxyMiddleware = function(req,res,next){
        var oConfig = this.getProxyConfigFromURL(req.url);

        if (oConfig.corpProxy){
            var oCorpProxyConfig = oConfig.corpProxy;
            this._handleProxyThroughCorporateProxy(
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
    }

    module.exports = new Utils();
}())
