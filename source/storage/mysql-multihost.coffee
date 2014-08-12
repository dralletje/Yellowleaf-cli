### Mysql multihost
Allows you to use one database for multiple installations.
No longer having many databases with only a few accounts.
###

Sequelize = require 'sequelize'

module.exports = (config, opts) ->
  sequelize = new Sequelize config.database, config.username, config.password,
    host: config.host

  sequelize.authenticate().then ->
    console.log 'Connection to database made.'
    ## Mysql model (Yes, only one)
    User = sequelize.define 'User',
      # Login creditials
      name:
        type: Sequelize.STRING
        unique: true
      password: Sequelize.STRING
      # Directory to move into
      directory: Sequelize.STRING
      # What host the user belongs to
      host: Sequelize.STRING

    sequelize
      .sync(force: opts.force)
      .then() # Get proper Promise
      .return(User)

  .then (User) ->
    (username, password) ->
      User.find
        where:
          name: username
          password: password
          host: config['current-host']

      .then() # Get proper Promise
      .catch (err) ->
        console.log 'Mysql error:', err
        throw err

      .then (result) ->
        # If no users found, DIE! :-D
        if not result?
          throw new Error 'Username and password combination incorrect.'
        result.directory

  .catch (err) ->
    throw new Error 'Unable to connect to the database:' + err
