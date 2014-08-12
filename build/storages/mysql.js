// YellowLeaf-cli FTP server by Michiel Dral 
var Sequelize;

Sequelize = require('sequelize');

module.exports = function(mysql) {
  var sequelize;
  console.log("YAAAA", mysql);
  sequelize = new Sequelize(mysql.database, mysql.user, mysql.password, {
    host: mysql.host
  });
  return sequelize.authenticate().then(function() {
    var User;
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
    return sequelize.sync()["return"](User);
  }).then(function(User) {
    return function(username, password) {
      return User.find({
        where: {
          username: username,
          password: password
        }
      }).then(function(result) {
        return console.log(result);
      });
    };
  });
};
