(function(){
	"use strict";

	var oConfigurationValidator = require('./ConfigurationValidator.js');

	function ConfigurationManager(){
		this._mProxies = {};
	};

	ConfigurationManager.prototype.addConfig = function(oProxyConfig){
			//Validate configs
			oConfigurationValidator.validateMandatoryProperties(oConfigurationValidator.mValidationConfigurations.DEFAULT,oProxyConfig);
			//Validate additional configs, if existent
			if (oProxyConfig.proxyTunnel){
					oConfigurationValidator.validateMandatoryProperties(oConfigurationValidator.mValidationConfigurations.PROXY_TUNNEL,oProxyConfig.proxyTunnel);
			}else if(oProxyConfig.proxy){
					oConfigurationValidator.validateMandatoryProperties(oConfigurationValidator.mValidationConfigurations.PROXY,oProxyConfig.proxy);
			}

			var sProxiedContext = oProxyConfig.context;
			var aProxiedContextParts = sProxiedContext.split('/');
			aProxiedContextParts.shift(); //Remove first item, as it is an empty string

			this._addConfigToTree(this._mProxies,aProxiedContextParts,oProxyConfig);
	};

	ConfigurationManager.prototype._addConfigToTree = function(oNavigator,aProxiedContextParts,oProxyConfig){
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

	ConfigurationManager.prototype._getConfigFromTree = function(oNavigator,aProxiedContextParts){
		var sPart = aProxiedContextParts.shift();
		if (sPart && oNavigator.hasOwnProperty(sPart)){
			oNavigator = oNavigator[sPart];
			return this._getConfigFromTree(oNavigator,aProxiedContextParts);
		}else {
			return oNavigator.__CONFIG__;
		}
	};

	ConfigurationManager.prototype.addConfigs = function(aConfigs){
			aConfigs.forEach(function(oConfig){
					this.addConfig(oConfig);
			}.bind(this));
	};

	ConfigurationManager.prototype.getProxyConfigFromURL = function(sURL){
			var aURLParts = sURL.split('/');
			aURLParts.shift(); //Remove 'empty string'
			var aContext = aURLParts;
			return this._getConfigFromTree(this._mProxies,aContext);
	};

	module.exports = new ConfigurationManager();
}());
