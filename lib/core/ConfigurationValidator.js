(function(){
	"use strict";

	function ConfigurationValidator(){};

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

	ConfigurationValidator.prototype.validateDefaultMandatoryProperties = function(oProxyConfig){
		ConfigurationValidator.prototype._validateMandatoryProperties(mDefaultConfigTypeValidation, oProxyConfig);
	};

	ConfigurationValidator.prototype.validateProxyMandatoryProperties = function(oProxyConfig){
		ConfigurationValidator.prototype._validateMandatoryProperties(mProxyTypeValidation, oProxyConfig);
	};

	ConfigurationValidator.prototype.validateProxyTunnelMandatoryProperties = function(oProxyConfig){
		ConfigurationValidator.prototype._validateMandatoryProperties(mProxyTunnelTypeValidation, oProxyConfig);
	};

	ConfigurationValidator.prototype._validateMandatoryProperties = function(mValidationConfig,oProxyConfig){
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

	module.exports = new ConfigurationValidator();
}());
