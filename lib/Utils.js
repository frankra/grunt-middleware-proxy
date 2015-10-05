
'use strict';

//TODO: Rework this logic. Map the TypeValidation to a kind of an array of validation functions. Each function should have its own error (and message). These will be processed on a loop
//TODO: Add a validation for the context not starting with a `/`
//TODO: Add a validation for the URL starting with a `/`
var mTypeValidation = {
    context: 'string',
    host : 'string'
};

var mErrorMessages = { //TODO: i18n model or something would be nice ;)
    'missing' : 'Error defining Proxy. Missing mandatory property "$1" on: ',
    'empty' : 'Error defining Proxy. Mandatory property "$1" is defined as an empty string on: ',
    'isNumber' : 'Error defining Proxy. Mandatory property "$1" is defined as number on: '
}

function throwValidationError(sType, sProperty, oErroneousConfiguration){
    throw new Error(mErrorMessages[sType].replace('$1',sProperty) + JSON.stringify(oErroneousConfiguration,2));
};

function validateMandatoryProperties(oProxyConfig){
    Object.keys(mTypeValidation).forEach(function(sKey){
        if (oProxyConfig.hasOwnProperty(sKey)){
            if (typeof oProxyConfig[sKey] === mTypeValidation[sKey]){
                if (oProxyConfig[sKey] === ''){
                    throwValidationError('empty',sKey,oProxyConfig);
                }
            }else {
                throwValidationError('isNumber',sKey,oProxyConfig);
            }
        }else {
            throwValidationError('missing',sKey,oProxyConfig);
        }
    });
};

function Utils(){
    this._mProxies = {};
};
//TODO: Enhance mapping logic. The ideal data structure is a tree since we can have the context defined like this contextA = `/api/something/api1` and contextB = `/api/something/api2`. This is not nice to solve with a simple string manipulation
Utils.prototype.addConfig = function(oProxyConfig){
    validateMandatoryProperties(oProxyConfig);

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

Utils.prototype.proxyMiddleware = function(){

};

module.exports = new Utils();
