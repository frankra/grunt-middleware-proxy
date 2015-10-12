require('../bootstrap')();
//Test Global Variables:
var fnTask;
var oUtils = require(process.cwd()+ '/lib/Utils');
chai.spy.on(oUtils,'addConfigs');

describe("/tasks.setup_proxies.prototype - Inspection", function() {
    it("Should be a function",function() {
		var _fnTask = require(process.cwd()+ '/tasks/setup_proxies');

        chai.expect(typeof _fnTask).to.equal("function");
	});
});
describe("/tasks.setup_proxies.prototype - Processing", function() {
    var sConfig;
    var oMockGrunt;

    var aServerProxies = [
        {
            context : '/test',
            host: 'www.google.com'
        },
        {
            context : '/test2',
            host: 'www.test.com'
        }
    ];
    var aDefaultProxies = [
        {
            context : '/test3',
            host: 'www.newtest.com'
        },
    ];
    beforeEach(function(){
        fnTask = require(process.cwd()+ '/tasks/setup_proxies');
        sConfig = 'server';
        oMockGrunt = {
            config : chai.spy(function(sConfigAlias){
                if (sConfigAlias === 'connect.server'){
                    return {proxies : aServerProxies};
                }else if (sConfigAlias === 'connect.proxies'){
                    return aDefaultProxies;
                }
            }),
            registerTask : chai.spy(function(sTaskName,fnTasknippet){
                fnTasknippet(sConfig);
            })
        }
        oUtils._mProxies = {}; //Reset proxy config
        oUtils.addConfigs.reset();
    });

    it("Should register itself as Grunt Task with alias 'setupProxies'",function() {

        fnTask(oMockGrunt);

        chai.expect(oMockGrunt.registerTask).to.have.been.called.exactly(1);
        chai.expect(oMockGrunt.registerTask.__spy.calls[0][0]).to.equal('setupProxies');
        chai.expect(typeof oMockGrunt.registerTask.__spy.calls[0][1]).to.equal('function');
	});

    it("Should fetch the proxy configuration from the given Grunt Task 'server'",function() {

        fnTask(oMockGrunt);

        chai.expect(oMockGrunt.config).to.have.been.called.exactly(1);
        chai.expect(oMockGrunt.config.__spy.calls[0][0]).to.equal('connect.server');

        chai.expect(oUtils.addConfigs).to.have.been.called.exactly(1);
        chai.expect(JSON.stringify(oUtils.addConfigs.__spy.calls[0][0])).to.equal(JSON.stringify(aServerProxies));
	});

    it("Should fetch the configuration from the default connect configuration and register as a GruntTask",function() {
        sConfig = undefined;

        fnTask(oMockGrunt);
        chai.expect(oMockGrunt.config).to.have.been.called.exactly(1);
        chai.expect(oMockGrunt.config.__spy.calls[0][0]).to.equal('connect.proxies');

        chai.expect(oUtils.addConfigs).to.have.been.called.exactly(1);
        chai.expect(JSON.stringify(oUtils.addConfigs.__spy.calls[0][0])).to.equal(JSON.stringify(aDefaultProxies));
	});
});
