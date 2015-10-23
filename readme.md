# Grunt Middleware function to Proxy Requests
> Provides a http/https proxy as middleware for the grunt-contrib-connect plugin. Supporting proxy over proxy and proxy tunneling.

[![Build Status](https://travis-ci.org/frankrafael/grunt-middleware-proxy.svg?branch=develop)](https://travis-ci.org/frankrafael/grunt-middleware-proxy)
[![Coverage Status](https://coveralls.io/repos/frankrafael/grunt-middleware-proxy/badge.svg?branch=develop&service=github)](https://coveralls.io/github/frankrafael/grunt-middleware-proxy?branch=develop)


## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-middleware-proxy --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-middleware-proxy');
```

## Adapting the  "connect" task


### Setup
In your project's Gruntfile, add a section named `proxies` to your existing connect definition.

#### Basic Proxy Configuration
```js
grunt.initConfig({
    connect: {
        server: {
            options: {
                port: 9000,
                hostname: 'localhost',
                middleware: function (connect, options, middlewares) {
                    /*Requires the Middleware snipped from the Library
                    and add it before the other Middlewares.*/
					middlewares.unshift(require('grunt-middleware-proxy/lib/Utils').getProxyMiddleware());
					return middlewares;
			    }
            },
            proxies: [{
                    context: '/yourapi', //REQUIRED! Must start with a '/' must not end with a '/'
                    host: 'api_server_domain.com', //REQUIRED! Should not contain 'http://' or 'https://'
                    port: 8080, //Optional, defaults to 80 if http or 443 if https
                    https: false,//Optional, defaults to false
                    auth: 'username:password', //Optional, adds the Authorization header
                    headers: {//Optional.
                        'header':'value'
                    }
            }]
        }
    }
})
```
#### Proxy over Proxy Configuration
```js
grunt.initConfig({
    connect: {
        server: {
            options: {
                port: 9000,
                hostname: 'localhost',
                middleware: function (connect, options, middlewares) {
                    /*Requires the Middleware snipped from the Library
                    and add it before the other Middlewares.*/
					middlewares.unshift(require('grunt-middleware-proxy/lib/Utils').getProxyMiddleware());
					return middlewares;
			    }
            },
            proxies: [{
                    context: '/yourapi', //REQUIRED! Must start with a '/' must not end with a '/'
                    host: 'api_server_domain.com', //REQUIRED! Should not contain 'http://' or 'https://'
                    port: 8080, //Optional, defaults to 80 if http or 443 if https
                    https: false,//Optional, defaults to false
                    /*auth is not supported*/
                    headers: {//Optional.
                        'header':'value'
                    },
                    proxy: {
                        host: 'proxy', //REQUIRED! Should not contain 'http://' or 'https://'
                        port: 8080,//Optional, defaults to 80 if http or 443 if https
                        https: false//Optional, defaults to false
                        /*proxy-specific headers are not supported as they are merged on the request`s header*/
                        /*auth is not supported*/
                    }
            }]
        }
    }
})
```
#### Proxy tunneling Configuration
```js
grunt.initConfig({
    connect: {
        server: {
            options: {
                port: 9000,
                hostname: 'localhost',
                middleware: function (connect, options, middlewares) {
                    /*Requires the Middleware snipped from the Library
                    and add it before the other Middlewares.*/
					middlewares.unshift(require('grunt-middleware-proxy/lib/Utils').getProxyMiddleware());
					return middlewares;
			    }
            },
            proxies: [{
                    context: '/yourapi', //REQUIRED! Must start with a '/' must not end with a '/'
                    host: 'api_server_domain.com', //REQUIRED! Should not contain 'http://' or 'https://'
                    port: 8080, //Optional, defaults to 80 if http or 443 if https
                    https: false,//Optional, defaults to false
                    auth: 'username:password', //Optional, adds the Authorization header
                    headers: {//Optional.
                        'header':'value'
                    },
                    proxyTunneling: {
                        host: 'proxy', //REQUIRED! Should not contain 'http://' or 'https://'
                        port: 8080,//Optional, defaults to 80 if http or 443 if https
                        https: false//Optional, defaults to false
                        auth: 'username:password', //Optional, adds the Authorization header
                        headers: {//Optional.
                            'header':'value'
                        },
                    }
            }]
        }
    }
})
```

### Registering the Grunt Task
```
grunt.registerTask('serve', [
	'setupProxies:server',
	'connect:server',
    'watch:default'
]);
```
**IMPORTANT**: You must specify the connect target in the `setupProxies` task.

### Options
The available configuration options from a given proxy based on the node [http](https://nodejs.org/api/http.html) and [https](https://nodejs.org/api/https.html) modules

#### options.context
>Type: `String`

>The context(s) to match requests against. Matching requests will be proxied. Should start with /. Should not end with /

#### options.host
>Type: `String`

>The host to proxy to. Should not start with the http/https protocol.

#### options.https
>Type: `Boolean`
>Default: false

>If the proxy should target a https end point on the destination server

#### options.port
>Type: `Number`

>If not provided by the configuration, will be defaulted to 80 if `https:false` or 443 if `https:true`

>The port to proxy to.

#### options.auth
>Type: `String`

>```auth : 'username:password'```

>Creates a new Authorization header on the request as defined by the Standard on HTTP.
>Basically creates:

>```
>headers : {
>    'Authorization' : 'Basic ' + btoa('username:password')
>}
```

#### options.headers
>Type: `Object`

>A map of headers to be added to proxied requests.

>```
>headers: {
>    'header':'value',
>    'anotherheader':'anothervalue'
>}
>```

### Options.proxy

#### options.proxy.host
>Type: `String`

>The host to proxy to. Should not start with the http/https protocol.

#### options.proxy.https
>Type: `Boolean`
>Default: false

>If the proxy should target a https end point on the destination server

#### options.proxy.port
>Type: `Number`

>If not provided by the configuration, will be defaulted to 80 if `https:false` or 443 if `https:true`

>The port to proxy to.

### Options.proxyTunnel

#### options.proxyTunnel.host
>Type: `String`

>The host to proxy to. Should not start with the http/https protocol.

#### options.proxyTunnel.https
>Type: `Boolean`
>Default: false

>If the proxy should target a https end point on the destination server

#### options.proxyTunnel.port
>Type: `Number`

>If not provided by the configuration, will be defaulted to 80 if `https:false` or 443 if `https:true`

>The port to proxy to.
#### options.proxyTunnel.auth
>Type: `String`

>```auth : 'username:password'```

>Creates a new Authorization header on the request as defined by the Standard on HTTP. Will be added to the Request for tunneling.
>Basically creates:

>```
>headers : {
>    'Authorization' : 'Basic ' + btoa('username:password')
>}
```

#### options.proxyTunnel.headers
>Type: `Object`

>A map of headers to be added to the tunneling request (CONNECT).


>```
>headers: {
>    'header':'value',
>    'anotherheader':'anothervalue'
>}
>```
