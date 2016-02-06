'use strict';
var oConfigManager = require('../lib/core/ConfigurationManager');

module.exports = function(oGrunt) {
    oGrunt.registerTask('setupProxies', function(sConfig) {
        var aProxyOptions = [];
        if (sConfig) {
            var aConnectOptions = oGrunt.config('connect.'+sConfig) || [];
            aProxyOptions = aProxyOptions.concat(aConnectOptions.proxies || []);
        } else {
            aProxyOptions = aProxyOptions.concat(oGrunt.config('connect.proxies') || []);
        }
        oConfigManager.addConfigs(aProxyOptions);
    });
};
