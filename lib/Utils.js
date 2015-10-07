(function(){
    'use strict';

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

    function Utils(){
        this._mProxies = {};
    };
    //TODO: Enhance mapping logic. The ideal data structure is a tree since we can have the context defined like this contextA = `/api/something/api1` and contextB = `/api/something/api2`. This is not nice to solve with a simple string manipulation
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
        var sHost = aURLParts.shift();
        var aContext = aURLParts;

        return this._getConfigFromTree(this._mProxies,aContext);
    };

    Utils.prototype.proxyMiddleware = function(req,res,next){
        if (req.url.match(/sdk\/resources/)){
            if (bUseProxy){
                var connectReq = http.request({ // establishing a tunnel
                    host: 'proxy',
                    port: 8080,
                    method: 'CONNECT',
                    path: 'sapui5.netweaver.ondemand.com:443',
                }).on('connect', function(proxyRes, socket, head) {
                    console.log('proxy connected')

                    https.get({ //https://sapui5.netweaver.ondemand.com/sdk/resources/sap-ui-core.js
                    host: "sapui5.netweaver.ondemand.com",
                    port: 443,
                    socket: socket,
                    agent : false,
                    path: req.url,
                    }, function (_res) {
                        console.log('res received - proxy')
                        _res.pipe(res);
                        next();
                    });
                }).on('error',function(){
                    console.log(arguments);
                }).end();
            }else {
                https.get({ //https://sapui5.netweaver.ondemand.com/sdk/resources/sap-ui-core.js
                host: "sapui5.netweaver.ondemand.com",
                port: 443,
                path: req.url,
                }, function (_res) {
                console.log('res received')
                _res.pipe(res);
                next();
                });
            }
        }else {
            next();
        }
    }

    module.exports = new Utils();
}())
