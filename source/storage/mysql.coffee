Sequelize = require 'sequelize'

module.exports = (mysql) ->
  sequelize = new Sequelize mysql.database, mysql.username, mysql.password,
    host: mysql.host

  sequelize.authenticate().then ->
    if err?
      throw new Error 'Unable to connect to the database:' + err

    console.log 'Connection to database made.'
    ## Mysql models
    User = sequelize.define 'User',
      name:
        type: Sequelize.STRING
        unique: true
      password: Sequelize.STRING
      directory: Sequelize.STRING

    t = sequelize
      .sync()
      .then()
      .return(User)

  .then (User) ->
    (username, password) ->
      User.find
        where:
          name: username
          password: password

      .fail (err) ->
        console.log 'Mysql error:', err
        throw err

      .then (result) ->
        # If no users found, DIE! :-D
        if not result?
          throw new Error 'Username and password combination incorrect.'

        console.log result
        result.directory
