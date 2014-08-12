// YellowLeaf-cli FTP server by Michiel Dral 
var Drive, Promise, command, config, ext, fs, getDirectory, opts, path, startFTP, yaml;

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

command = opts._[0] || 'run';

getDirectory = void 0;

Promise["try"](function() {
  if (command === 'run' || command === 'install') {
    return Promise["try"](function() {
      var storageConfig, storageFactory, storageOpts;
      storageFactory = require("./storage/" + config.storage);
      storageConfig = config.storages[config.storage];
      storageOpts = {
        force: command === 'install'
      };
      return storageFactory(storageConfig, storageOpts);
    }).then(function(fn) {
      return getDirectory = fn;
    })["catch"](function(e) {
      throw new Error("Error loading storage: " + e);
    });
  }
}).then(function() {
  if (command === 'install') {
    console.log('Install done! ;-D');
    return;
  }
  if (command !== 'run') {
    throw new Error('Unknown command :\'-(');
  }
  startFTP(function(user, password) {
    return getDirectory(user, password).then(function(directory) {
      directory = path.join('/', directory);
      return new Drive(config.base + directory);
    });
  }, config.port);
  return console.log("Welcome! Listening at port " + config.port + "!");
})["catch"](function(e) {
  return console.log("Sorry,\n\nI couldn't start the server.\nMaybe you know what happened when looking at this:\n" + e.message + "\n\nLove, Michiel.");
});
