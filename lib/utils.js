
'use strict';

//TODO: Rework this logic. Map the TypeValidation to a kind of an array of validation functions. Each function should have its own error (and message). These will be processed on a loop
//TODO: Add a validation for the context not starting with a `/`
//TODO: Add a validation for the URL starting with a `/`
var mTypeValidation = {
    context: 'string',
    host : 'string'
};

var mErrorMessages = {
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
    if (this._mProxies.hasOwnProperty(sProxiedContext)) {
        throw new Error('Context ' + sProxiedContext + ' proxied twice! Check your configuration.');
    }

    this._mProxies[sProxiedContext] = oProxyConfig;
};

// Import.prototype.mapModulePath = function(sAlias,sPhysicalPath){
// 		var aAliasParts = sAlias.split('.');
// 		this._setRegisterFromAlias(this._mPathTree,aAliasParts,sAlias,sPhysicalPath);
// 		return this;
// 	};
//
// 	Import.prototype._setRegisterFromAlias = function(oNavigator,aAliasParts,sAlias,sPhysicalPath){
// 		var sPart = aAliasParts.splice(0,1)[0];
// 		if (sPart){
// 			if (!oNavigator.hasOwnProperty(sPart)){
// 				oNavigator = oNavigator[sPart] = {};
// 			}else {
// 				oNavigator = oNavigator[sPart];
// 			}
// 			//Recursion can cause Stack-overflow errors. JS don't support tail calculation
// 			//TODO: ES6 will improve tail calculation \o/
// 			this._setRegisterFromAlias(oNavigator,aAliasParts,sAlias,sPhysicalPath);
// 		}else {
// 			oNavigator.path = sPhysicalPath
// 			oNavigator.alias = sAlias;
// 		};
// 	};
//
// 	Import.prototype._getRegisterFromAlias = function(oNavigator,aAliasParts){
// 		var sPart = aAliasParts.splice(0,1)[0];
// 		if (sPart && oNavigator.hasOwnProperty(sPart)){
// 			oNavigator = oNavigator[sPart];
// 			return this._getRegisterFromAlias(oNavigator,aAliasParts);
// 		}else if (oNavigator.hasOwnProperty('alias')){
// 			return oNavigator;
// 		}else {
// 			throw new Error('Import.prototype._getRegisterFromAlias: Attribute "path" not found.' + sAliasParts.join('.'));
// 		}
// 	};

Utils.prototype.addConfigs = function(aConfigs){
    aConfigs.forEach(function(oConfig){
        this.addConfig(oConfig);
    }.bind(this));
};

Utils.prototype.getProxyConfigFromURL = function(sURL){
    var aURLParts = sURL.split('/');
    var sHost = aURLParts[0];
    var sContext = aURLParts[1];
    var aProxiedContexts = Object.keys(this._mProxies);

    for (var i = 0, ii = aProxiedContexts.length; i < ii; i++){

    }
};

Utils.prototype.proxyMiddleware = function(){

};

module.exports = new Utils();
