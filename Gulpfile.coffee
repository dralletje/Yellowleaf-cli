gulp = require("gulp")
plumber = require("gulp-plumber")
coffee = require("gulp-coffee")
header = require("gulp-header")

paths =
  coffee: './source/**/*.coffee'

gulp.task "coffee", (cb) ->
  gulp.src(paths.coffee)
    .pipe(plumber())
    .pipe(coffee(bare: true))
    .pipe(header("""
      #!/usr/bin/env node
      // YellowLeaf-cli FTP server by Michiel Dral \n
    """))
    .pipe(gulp.dest('./build/'))


# Rerun the task when a file changes
gulp.task "watch", ->
  gulp.watch paths.coffee, ["coffee"]

gulp.task "default", [
  "coffee"
]
