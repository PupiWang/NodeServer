
// Modules
var express = require('express'),
  http = require('http'),
  path = require('path');

exports.app = express();

// Files
var server_socket = require('./routes/socket'),
  appConf = require('./appConf'),
  routes = require('./routes');

// Server initing...
var server = require('http').createServer(exports.app);

server.listen(exports.app.get('port'));