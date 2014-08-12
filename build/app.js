// YellowLeaf-cli FTP server by Michiel Dral 
var Drive, Promise, config, ext, fs, opts, path, startFTP, yaml;

startFTP = require('yellowleaf/build/ftp');

Drive = require('yellowleaf/build/filesystem');

fs = require('fs');

yaml = require('js-yaml').safeLoad;

path = require('path');

Promise = require('bluebird');

opts = require("nomnom").option('config', {
  required: true,
  string: '-c FILE, --config=FILE',
  "default": 'config.yml',
  help: 'YML/JSON file with configuration.'
}).parse();

config = fs.readFileSync(opts.config);

ext = opts.config.split('.').slice(-1)[0];

if (ext === 'json') {
  config = JSON.parse(config);
} else if (ext === 'yml') {
  config = yaml(config);
} else {
  throw new Error("Can only parse .json or .yml file, not " + ext + " files.");
}

if (config.base == null) {
  config.base = '/';
}

Promise["try"](function() {
  var storageConfig, storageFactory;
  storageFactory = require("./storage/" + config.storage);
  storageConfig = config.storages[config.storage];
  return storageFactory(storageConfig);
})["catch"](function(e) {
  throw new Error("Error loading storage: " + e);
}).then(function(getDirectory) {
  startFTP(function(user, password) {
    return getDirectory(user, password).then(function(directory) {
      directory = path.join('/', directory);
      return new Drive(config.base + directory);
    });
  }, config.port);
  return console.log("Welcome! Listening at port " + config.port + "!");
})["catch"](function(e) {
  return console.log("Sorry,\nI couldn't start the server.\n" + e.message + "\n\nLove, Michiel.");
});
