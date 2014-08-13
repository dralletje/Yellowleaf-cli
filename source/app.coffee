FTP = require 'yellowleaf/build/ftp'
Drive = require 'yellowleaf/build/filesystem'

fs   = require 'fs'
yaml = require('js-yaml').safeLoad
path = require 'path'
Promise = require 'bluebird'
bcrypt = Promise.promisifyAll require('bcryptjs')

# Load options (Only the config file and command for now :p)
opts = require("nomnom")
  .help("""
    You can currently use four commands:
    Run, install, hashpass and resetconf
    Resetconf will place the default conf where you specified the config.
    Install will ehh.. install (:p) the storage engine.
    Run will ehh.. again just run the server! :-D
    Hashpass will hash the password your send with it.
  """)
  .option 'config',
    required: yes
    string: '-c FILE, --config=FILE'
    default: 'config.yml'
    help: 'YML/JSON file with configuration.'
  .parse()

# First unnamed argument is the command
command = opts._[0] or 'run'

# When loading the config, stop here!
if command is 'resetconf'
  myconf = __dirname + '/../config.yml'
  console.log "Moving config from #{myconf} to #{opts.config}..."
  fs.writeFileSync opts.config, fs.readFileSync(myconf)

  console.log "Reset the config at #{opts.config} to the default one!"
  console.log "(I hope for you that it is a yaml file you specified.)"
  return


if command is 'hashpass'
  password = opts._[1]
  if not password?
    throw new Error 'Please pass a password as second argument!'
  bcrypt.hashAsync(password, 8).then (hash) ->
    console.log 'Your hash is ready:'
    console.log hash

  .catch (err) ->
    console.log err, '!!!'
  return

# Load the file in
config = fs.readFileSync opts.config

# Parse it!
ext = opts.config.split('.').slice(-1)[0]
if ext is 'json'
  config = JSON.parse config
else if ext is 'yml'
  config = yaml config
else
  throw new Error "Can only parse .json or .yml file, not #{ext} files."

# Verify some
config.base ?= '/'
config.port ?= 21


# Run the command
getDirectory = undefined

Promise.try ->
  # On run and install, get storage engine
  if command is 'run' or command is 'install'
    Promise.try ->
      # Load the 'storage engine' factory
      storageFactory = require "./storage/#{config.storage}"
      storageConfig  = config.storages[config.storage]
      # When running install, do a force install! (Erase data)
      storageOpts =
        force: command is 'install'

      # Initialize the storage with the config options
      storageFactory(storageConfig, storageOpts)

    .then (fn) ->
      getDirectory = fn

    .catch (e) ->
      throw new Error "Error loading storage: #{e}"

.then ->
  # When installing, stop here!
  if command is 'install'
    console.log 'Install done! ;-D'
    return

  # Only install and run are possible commands
  if command isnt 'run'
    throw new Error 'Unknown command :\'-('

  # Start the FTP server and start listening
  FTP (user, password) ->
    # Get the password hash and the directory
    getDirectory(user).spread (hash, directory) ->
      # Save directory
      @directory = directory
      # Check if the password matches the hash
      bcrypt.compareAsync(password, hash)

    .then (valid) ->
      if not valid
        throw new Error 'Bad login.'

      directory = path.join '/', @directory
      new Drive config.base + directory


  .debug(no)
  .listen(config.port)

  console.log "Welcome! Listening at port #{config.port}!"

.catch (e) ->
  # An error, give a nice message ;-D
  console.log """
    Sorry,

    I couldn't start the server.
    Maybe you know what happened when looking at this:
    #{e.stack}

    Love, Michiel.
  """
