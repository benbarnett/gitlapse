'use strict';

var webshot = require('webshot');
var ProgressBar = require('progress');

var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

var GitWalker = require('../lib/gitWalker');

class GitLapse {
  constructor(config) {
    this.config = Object.assign({
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
    }, config);

    this.gitWalker = new GitWalker(config);
  }

  go() {
    this.gitWalker.init((err) => {
      if (err) {
        console.log('There was an error finding those commits.\nHave you set the working directory?\nAre those revisions correct?');
        console.log(err);
        return false;
      }

      // Git repo is prepared, let's check out the commits and build screenshots
      this.timer('gitlapse');

      this.progressBar = new ProgressBar('  generating [:bar] :percent :current/:total', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: this.gitWalker.commits.length
      });

      this._processCommits();
    });
  }

  onComplete() {
    console.log(`All done! Screenshots are in ${path.resolve(this.config.output)}`);
    this.timer('gitlapse', true);
    return;
  }

  log(msg) {
    if (this.config.debug) console.log(`${msg}`);
  }

  timer(id, finished) {
    if (this.config.debug) console[finished ? 'timeEnd' : 'time'](id);
  }

  _processCommits() {
    this.gitWalker.checkoutNextCommit((err, out, commit) => {
      if (out === 'FINISHED') return this.onComplete();

      this.progressBar.tick(1);

      this.log(`\nRunning setup script for ${commit.hash} (${commit.message})`);
      this.timer(commit.hash);

      var setup = spawnSync('sh', [path.resolve(this.config.scripts.setup)], { cwd: this.config.repo });
      var server = spawn('sh', [path.resolve(this.config.scripts.server)], { cwd: this.config.repo, detached: true });

      this.log(`Starting server & capturing ${commit.hash} (${commit.message})`);

      webshot(this.config.uri,
        `${path.normalize(this.config.output)}/${commit.hash}.png`,
        {
          screenSize: {
            width: this.config.window.width,
            height: this.config.window.height
          }
        },
        (err) => {
          this.timer(commit.hash, true);
          this.log(`Done. Shutting down server.\n`);

          try {
            process.kill(-server.pid, 'SIGTERM');
          }
          catch(e) {
            this.log(`Failed to shutdown server with pid ${-server.pid}`);
          }

          this._processCommits();
      });
    });
  }
}

module.exports = GitLapse;
