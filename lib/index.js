'use strict';

module.exports = function(args) {
  var config = Object.assign({
    'start-revision': '',
    'end-revision': '',
    'repo': __dirname,
    'steps': 1,
    'scripts': {
      'setup': 'scripts/setup.sh',
      'server': 'scripts/server.sh'
    },
    'uri': 'http://localhost:8080',
    'output': 'dist',
    'window': {
      'width': 1280,
      'height': 800
    },
    'debug': false
  }, args);

  var webshot = require('webshot');
  var ProgressBar = require('progress');

  var path = require('path');
  var exec = require('child_process').exec;
  var spawn = require('child_process').spawn;
  var spawnSync = require('child_process').spawnSync;

  var gitWalker = require('../lib/gitWalker')(config);

  var progressBar;

  gitWalker.init((err) => {
    if (err) {
      console.log('There was an error finding those commits.\nHave you set the working directory?\nAre those revisions correct?');
      console.log(err);
      return false;
    }

    // Git repo is prepared, let's check out the commits and build screenshots
    timer('gitlapse');

    progressBar = new ProgressBar('  generating [:bar] :percent :current/:total', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: gitWalker.commits.length
    });

    doTheWalk();
  });

  function log(msg) {
    if (config.debug) console.log(`${msg}`);
  }

  function timer(id, finished) {
    if (config.debug) console[finished ? 'timeEnd' : 'time'](id);
  }

  function doTheWalk() {
    gitWalker.checkoutNextCommit((err, out, commit) => {
      if (out === 'FINISHED') {
        console.log(`All done! Screenshots are in ${path.resolve(config.output)}`);
        timer('gitlapse', true);
        return;
      }

      progressBar.tick(1);


      log(`\nRunning setup script for ${commit.hash} (${commit.message})`);
      timer(commit.hash);

      var setup = spawnSync('sh', [path.resolve(config.scripts.setup)], { cwd: config.repo });
      var server = spawn('sh', [path.resolve(config.scripts.server)], { cwd: config.repo, detached: true });

      log(`Starting server & capturing ${commit.hash} (${commit.message})`);

      webshot(config.uri,
        `${path.normalize(config.output)}/${commit.hash}.png`,
        {
          screenSize: {
            width: config.window.width,
            height: config.window.height
          }
        },
        function(err) {
          timer(commit.hash, true);
          log(`Done. Shutting down server.\n`);

          try {
            process.kill(-server.pid, 'SIGTERM');
          }
          catch(e) {
            log(`Failed to shutdown server with pid ${-server.pid}`);
          }

          doTheWalk();
      });
    });
  }
}
