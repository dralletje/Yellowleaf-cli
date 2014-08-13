#!/usr/bin/env node
// YellowLeaf-cli FTP server by Michiel Dral 

/* Mysql multihost
Allows you to use one database for multiple installations.
No longer having many databases with only a few accounts.
 */
var Sequelize;

Sequelize = require('sequelize');

module.exports = function(config, opts) {
  var sequelize;
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host
  });
  return sequelize.authenticate().then(function() {
    var User;
    console.log('Connection to database made.');
    User = sequelize.define('User', {
      name: {
        type: Sequelize.STRING,
        unique: true
      },
      password: Sequelize.STRING,
      directory: Sequelize.STRING,
      host: Sequelize.STRING
    });
    return sequelize.sync({
      force: opts.force
    }).then()["return"](User);
  }).then(function(User) {
    return function(username, password) {
      return User.find({
        where: {
          name: username,
          host: config['current-host']
        }
      }).then()["catch"](function(err) {
        console.log('Mysql error:', err);
        throw err;
      }).then(function(result) {
        if (result == null) {
          throw new Error('Bad login.');
        }
        return [result.password, result.directory];
      });
    };
  })["catch"](function(err) {
    throw new Error('Unable to connect to the database:' + err);
  });
};
