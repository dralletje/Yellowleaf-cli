#!/usr/bin/env node
// YellowLeaf-cli FTP server by Michiel Dral 
var Drive, FTP, Promise, bcrypt, command, config, ext, fs, getDirectory, myconf, opts, password, path, yaml;

FTP = require('yellowleaf/build/ftp');

Drive = require('yellowleaf/build/filesystem');

fs = require('fs');

yaml = require('js-yaml').safeLoad;

path = require('path');

Promise = require('bluebird');

bcrypt = Promise.promisifyAll(require('bcryptjs'));

opts = require("nomnom").help("You can currently use four commands:\nRun, install, hashpass and resetconf\nResetconf will place the default conf where you specified the config.\nInstall will ehh.. install (:p) the storage engine.\nRun will ehh.. again just run the server! :-D\nHashpass will hash the password your send with it.").option('config', {
  required: true,
  string: '-c FILE, --config=FILE',
  "default": 'config.yml',
  help: 'YML/JSON file with configuration.'
}).parse();

command = opts._[0] || 'run';

if (command === 'resetconf') {
  myconf = __dirname + '/../config.yml';
  console.log("Moving config from " + myconf + " to " + opts.config + "...");
  fs.writeFileSync(opts.config, fs.readFileSync(myconf));
  console.log("Reset the config at " + opts.config + " to the default one!");
  console.log("(I hope for you that it is a yaml file you specified.)");
  return;
}

if (command === 'hashpass') {
  password = opts._[1];
  if (password == null) {
    throw new Error('Please pass a password as second argument!');
  }
  bcrypt.hashAsync(password, 8).then(function(hash) {
    console.log('Your hash is ready:');
    return console.log(hash);
  })["catch"](function(err) {
    return console.log(err, '!!!');
  });
  return;
}

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

if (config.port == null) {
  config.port = 21;
}

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
  FTP(function(user, password) {
    return getDirectory(user).spread(function(hash, directory) {
      this.directory = directory;
      return bcrypt.compareAsync(password, hash);
    }).then(function(valid) {
      var directory;
      if (!valid) {
        throw new Error('Bad login.');
      }
      directory = path.join('/', this.directory);
      return new Drive(config.base + directory);
    });
  }).debug(false).listen(config.port);
  return console.log("Welcome! Listening at port " + config.port + "!");
})["catch"](function(e) {
  return console.log("Sorry,\n\nI couldn't start the server.\nMaybe you know what happened when looking at this:\n" + e.message + "\n\nLove, Michiel.");
});
