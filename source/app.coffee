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


Promise.try ->
  # Load the 'storage engine' factory
  storageFactory = require "./storage/#{config.storage}"
  storageConfig  = config.storages[config.storage]
  # Initialize the storage with the config options
  return storageFactory(storageConfig)

.catch (e) ->
  throw new Error "Error loading storage: #{e}"

.then (getDirectory) ->
  startFTP (user, password) ->
    getDirectory(user, password).then (directory) ->
      directory = path.join '/', directory
      new Drive config.base + directory
  , config.port

  console.log "Welcome! Listening at port #{config.port}!"

.catch (e) ->
  console.log """
    Sorry,
    I couldn't start the server.
    #{e.message}

    Love, Michiel.
  """
