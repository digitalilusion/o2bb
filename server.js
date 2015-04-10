var connect = require('connect');
var serveStatic = require('serve-static');
var proxy = require('proxy-middleware');
var url = require('url');
var app = connect();
app.use('/html', serveStatic(__dirname));
app.use('/orion', proxy(url.parse('http://orion.lab.fiware.org:1026')));
app.listen(8080);
