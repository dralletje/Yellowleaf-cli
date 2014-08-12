// YellowLeaf-cli FTP server by Michiel Dral 
var Sequelize;

Sequelize = require('sequelize');

module.exports = function(mysql) {
  var sequelize;
  sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, {
    host: mysql.host
  });
  return sequelize.authenticate().then(function() {
    var User, t;
    if (typeof err !== "undefined" && err !== null) {
      throw new Error('Unable to connect to the database:' + err);
    }
    console.log('Connection to database made.');
    User = sequelize.define('User', {
      name: {
        type: Sequelize.STRING,
        unique: true
      },
      password: Sequelize.STRING,
      directory: Sequelize.STRING
    });
    return t = sequelize.sync().then()["return"](User);
  }).then(function(User) {
    return function(username, password) {
      return User.find({
        where: {
          name: username,
          password: password
        }
      }).fail(function(err) {
        console.log('Mysql error:', err);
        throw err;
      }).then(function(result) {
        if (result == null) {
          throw new Error('Username and password combination incorrect.');
        }
        console.log(result);
        return result.directory;
      });
    };
  });
};
