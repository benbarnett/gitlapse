'use strict';

module.exports = function(args) {
  var config = Object.assign({
    'start-commit': '',
    'end-commit': '',
    'repo': __dirname,
    'setup': './test/fixtures/setup.sh',
    'server': './test/fixtures/server.sh',
    'url': 'http://localhost:8080',
    'output': './dist',
    'width': 1280,
    'height': 800,
    'silent': false
  }, args);

  var webshot = require('webshot');
  var path = require('path');
  var exec = require('child_process').exec;
  var spawn = require('child_process').spawn;
  var spawnSync = require('child_process').spawnSync;

  var gitWalker = require('../lib/gitWalker')(config);

  gitWalker.init(() => {
    // Git repo is prepared, let's check out the commits and build screenshots
    console.time('gitlapse');
    doTheWalk();
  });

  function log(msg) {
    if (!config.silent) console.log(msg);
  }

  function doTheWalk() {
    gitWalker.checkoutNextCommit((err, out, commit) => {
      if (out === 'FINISHED') {
        log(`\n\nAll done! Screenshots are in ${path.resolve(config.output)}`);
        console.timeEnd('gitlapse');
        return;
      }

      log(`Running setup script for ${commit.hash} (${commit.message})`);
      console.time(commit.hash);

      let setup = spawnSync('sh', [path.resolve(config.setup)], { cwd: config.repo });
      let server = spawn('sh', [path.resolve(config.server)], { cwd: config.repo, detached: true });

      log(`Starting server & capturing ${commit.hash} (${commit.message})`);

      webshot(config.url,
        `${path.normalize(config.output)}/${commit.hash}.png`,
        {
          screenSize: {
            width: config.width,
            height: config.height
          }
        },
        function(err) {
          console.timeEnd(commit.hash);
          log(`Done. Shutting down server.\n`);

          process.kill(-server.pid);
          doTheWalk();
      });
    });
  }
}
