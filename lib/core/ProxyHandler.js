(function(){
	"use strict";

	var DEFAULT_HTTPS_PORT = 443;
	var DEFAULT_HTTP_PORT = 80;

	function ProxyHandler(){
		this._mProtocols = {
				'http' : require('http'),
				'https' : require('https')
		};
	};

	ProxyHandler.prototype.proxyTunneling = function(oConfig,req,res){
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
					var oProxyRequest = oProxyConnector.request({
							host: oConfig.host,
							port: iProxyPort,
							socket: oSocket,
							method : req.method,
							path : req.url,
							auth : sAuthData,
							headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
					}, function (oResponse) {
							this._pipeResponseBackToOriginalRes(oResponse,res);
					}.bind(this));

					this._pipeOriginalReqBodyToProxyRequest(req,oProxyRequest);
			}.bind(this)).end();
	};

	ProxyHandler.prototype.proxyThroughProxy = function(oConfig,req,res){
			var oProxyConfig = oConfig.proxy;
			var sProxyProtocol = this._resolveProtocolFromConfig(oProxyConfig);
			var oProxyConnector = this._resolveConnectorForProtocol(sProxyProtocol);
			var iProxyPort = this._resolvePortFromConfig(oProxyConfig);

			var sPathProtocol = this._resolveProtocolFromConfig(oConfig);
			var iPathPort = this._resolvePortFromConfig(oConfig);

		var oProxyRequest =	oProxyConnector.request({
					host: oProxyConfig.host,
					port: iProxyPort,
					method: req.method,
					path: sPathProtocol + '://' + oConfig.host + ':' + iPathPort + req.url,
					headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
			}, function (oResponse) {
					this._pipeResponseBackToOriginalRes(oResponse,res);
			}.bind(this));

			this._pipeOriginalReqBodyToProxyRequest(req,oProxyRequest);
	};

	ProxyHandler.prototype.proxyRequest = function(oConfig,req,res){
			var sProxyProtocol = this._resolveProtocolFromConfig(oConfig);
			var oProxyConnector = this._resolveConnectorForProtocol(sProxyProtocol);
			var iProxyPort = this._resolvePortFromConfig(oConfig);
			var sAuthData = req.auth ? req.auth : oConfig.auth;

			var oProxyRequest = oProxyConnector.request({
					host: oConfig.host,
					port: iProxyPort,
					method: req.method,
					path: req.url,
					auth : sAuthData,
					headers : this._prepareHeadersToBeForwarded(oConfig.host, oConfig.headers, req.headers)
			}, function (oResponse) {
					console.log('response from:', oConfig.host,iProxyPort, req.url)
					this._pipeResponseBackToOriginalRes(oResponse,res);
			}.bind(this));

			this._pipeOriginalReqBodyToProxyRequest(req,oProxyRequest);
	};

	ProxyHandler.prototype._prepareHeadersToBeForwarded = function(sHost, oConfigHeaders, oReqHeaders){
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

	ProxyHandler.prototype._resolveProtocolFromConfig = function(oConfig){
			return oConfig.https ? 'https' : 'http';
	};
	ProxyHandler.prototype._resolvePortFromConfig = function(oConfig){
			return oConfig.port ? oConfig.port : oConfig.https ? DEFAULT_HTTPS_PORT : DEFAULT_HTTP_PORT;
	};
	ProxyHandler.prototype._resolveConnectorForProtocol = function(sHttpOrHttps){
			return this._mProtocols[sHttpOrHttps];
	};

	ProxyHandler.prototype._pipeResponseBackToOriginalRes = function(oProxyRes, oOriginalRes){
		oOriginalRes.writeHead(oProxyRes.statusCode,oProxyRes.headers);
		oProxyRes.pipe(oOriginalRes,{end:false});

		oProxyRes.on('end',function(){
			oOriginalRes.end();
		});
	};

	ProxyHandler.prototype._pipeOriginalReqBodyToProxyRequest = function(req,oProxyRequest){
		var aBody = [];
		var sBody = '';

		req.on('data', function(sChunk) {
			aBody.push(sChunk);

		}).on('end', function() {
			sBody = Buffer.concat(aBody).toString();

			oProxyRequest.write(sBody);
			oProxyRequest.end();
		});
	};

	module.exports = new ProxyHandler();
}());
