// YellowLeaf-cli FTP server by Michiel Dral 

/* Mysql
Just loads the users from a mysql table called Users.
It will make the table itself with the install (or if it empty, just run) command.
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
      directory: Sequelize.STRING
    });
    return sequelize.sync({
      force: opts.force
    }).then()["return"](User);
  }).then(function(User) {
    return function(username) {
      return User.find({
        where: {
          name: username
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
