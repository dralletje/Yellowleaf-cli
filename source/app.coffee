startFTP = require 'yellowleaf/build/ftp'
Drive = require 'yellowleaf/build/filesystem'

fs   = require 'fs'
yaml = require('js-yaml').safeLoad
path = require 'path'
Promise = require 'bluebird'

opts = require("nomnom")
  .option 'config',
    required: yes
    string: '-c FILE, --config=FILE'
    default: 'config.yml'
    help: 'YML/JSON file with configuration.'
  .parse();


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
command = opts._[0] or 'run'


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
  if command is 'install'
    console.log 'Install done! ;-D'
    return

  if command isnt 'run'
    throw new Error 'Unknown command :\'-('

  startFTP (user, password) ->
    getDirectory(user, password).then (directory) ->
      directory = path.join '/', directory
      new Drive config.base + directory
  , config.port
  console.log "Welcome! Listening at port #{config.port}!"

.catch (e) ->
  # An error, give a nice message ;-D
  console.log """
    Sorry,

    I couldn't start the server.
    Maybe you know what happened when looking at this:
    #{e.message}

    Love, Michiel.
  """
