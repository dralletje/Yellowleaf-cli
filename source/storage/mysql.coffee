### Mysql
Just loads the users from a mysql table called Users.
It will make the table itself with the install (or if it empty, just run) command.
###

Sequelize = require 'sequelize'

module.exports = (config, opts) ->
  sequelize = new Sequelize config.database, config.username, config.password,
    host: config.host

  sequelize.authenticate().then ->
    console.log 'Connection to database made.'
    ## Mysql models
    User = sequelize.define 'User',
      name:
        type: Sequelize.STRING
        unique: true
      password: Sequelize.STRING
      directory: Sequelize.STRING

    sequelize
      .sync(force: opts.force)
      .then() # Get proper Promise
      .return(User)

  .then (User) ->
    # Return the finder function
    (username) ->
      User.find
        where:
          name: username

      .then() # Get proper Promise
      .catch (err) ->
        console.log 'Mysql error:', err
        throw err

      .then (result) ->
        # If no users found, DIE! :-D
        if not result?
          throw new Error 'Bad login.'
        [result.password, result.directory]

  .catch (err) ->
    throw new Error 'Unable to connect to the database:' + err
