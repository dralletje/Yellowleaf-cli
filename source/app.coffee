startFTP = require 'yellowleaf/ftp'
Drive = require 'yellowleaf/filesystem'

## FIXME: Make it work XD
throw new Error 'Well yeah, it is just no finished yet!'

opts = require("nomnom")
  .option 'config',
    required: yes
    string: '-c FILE, --config=FILE'
    default: 'config.yml'
    help: 'YML/JSON file with configuration.'
  .parse();

config = {}

startFTP (user, password) ->
  directory =
    if user is 'jonas' and password is 'jonas'
      "jonas.web.dral.eu"

    else if user is 'plancke' and password is 'eff60fc8'
      "plancke.nl"
  new Drive "/home/#{directory}"
, config.port
