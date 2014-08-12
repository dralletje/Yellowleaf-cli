// YellowLeaf-cli FTP server by Michiel Dral 
var Drive, config, opts, startFTP;

startFTP = require('yellowleaf/ftp');

Drive = require('yellowleaf/filesystem');

throw new Error('Well yeah, it is just no finished yet!');

opts = require("nomnom").option('config', {
  required: true,
  string: '-c FILE, --config=FILE',
  "default": 'config.yml',
  help: 'YML/JSON file with configuration.'
}).parse();

config = {};

startFTP(function(user, password) {
  var directory;
  directory = user === 'jonas' && password === 'jonas' ? "jonas.web.dral.eu" : user === 'plancke' && password === 'eff60fc8' ? "plancke.nl" : void 0;
  return new Drive("/home/" + directory);
}, config.port);
