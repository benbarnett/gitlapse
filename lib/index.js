'use strict';

var webshot = require('webshot');
var ProgressBar = require('progress');

var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var request = require('request');

var GitWalker = require('../lib/GitWalker');
var Slideshow = require('../lib/Slideshow');

class GitLapse {
  constructor(config) {
    this.config = Object.assign({
      startRevision: '',
      endRevision: '',
      repo: __dirname,
      steps: 1,
      scripts: {
        setup: 'scripts/setup.sh',
        server: 'scripts/server.sh'
      },
      uri: 'http://localhost:8080',
      timeout: 10000,
      attemptLimit: 30,
      delayBetweenAttemps: 6000,
      output: 'dist',
      window: {
        width: 1280,
        height: 800
      },
      debug: false
    }, config);

    this.gitWalker = new GitWalker(config);
    this.slides = [];
    this.serverAttempts = 0;
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

    return this;
  }

  onComplete() {
    var slideshow = new Slideshow(this.slides, {
      output: path.resolve(this.config.output)
    });

    this.log('Generating slideshow');
    this.timer('slideshow');
    slideshow.save((err) => {
      if (err) throw new Error(err);

      this.timer('slideshow', true);
      console.log(`All done! Screenshots are in ${path.resolve(this.config.output)}`);
      return;
    });

    this.timer('gitlapse', true);
  }

  log(msg) {
    if (this.config.debug) console.log(`${msg}`);
  }

  timer(id, finished) {
    if (this.config.debug) console[finished ? 'timeEnd' : 'time'](id);
  }

  checkServerAlive(done) {
    this.log('Attempting to connect to server');

    request({ url: this.config.uri, timeout: this.config.timeout }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        return done(true)
      }
      else {
        console.log(err, res);
        return done(false);
      }
    });
  }

  pollServer(done) {
    this.serverAttempts++;

    this.checkServerAlive((alive) => {
      if (alive) {
        return done();
      }

      if (this.serverAttempts >= this.config.attemptLimit) {
        return done(`Failed to connect to server ${this.serverAttempts} times, aborting.`);
      }

      // Wait a second and then try again
      setTimeout(() => {
        this.pollServer(done);
      }, this.config.delayBetweenAttemps);
    });
  }

  takeScreenshot(commit, done) {
    webshot(this.config.uri,
      `${path.normalize(this.config.output)}/${commit.hash}.png`,
      {
        screenSize: {
          width: this.config.window.width,
          height: this.config.window.height
        }
      },
      (err) => {
        // if (err) throw new Error(err);

        this.slides.push({
          src: `${commit.hash}.png`,
          caption: commit.hash
        });

        done();
    });
  }

  _processCommits() {
    this.gitWalker.checkoutNextCommit((err, out, commit) => {
      if (out === 'FINISHED') return this.onComplete();

      this.progressBar.tick(1);

      this.log(`\nRunning setup script for ${commit.hash} (${commit.message}) – ${path.resolve(this.config.scripts.setup)}`);
      this.timer(commit.hash);

      let setup = spawn('sh', [path.resolve(this.config.scripts.setup)], {
        cwd: this.config.repo,
        stdio: 'pipe',
        encoding: 'utf-8',
        shell: true
      });

      setup.stdout.on('data', (chunk) => {
        this.log(`SETUP STDOUT: ${chunk}`);
      });

      setup.on('close', (code) => {
        this.log(`Starting server & capturing ${commit.hash} (${commit.message})`);

        let server = spawn('sh', [path.resolve(this.config.scripts.server)], {
          cwd: this.config.repo,
          stdio: 'pipe',
          encoding: 'utf-8',
          shell: true
        });

        server.stdout.on('data', (chunk) => {
          this.log(`SERVER STDOUT: ${chunk}`);
        });

        server.stderr.on('data', (chunk) => {
          this.log(`SERVER STDERR: ${chunk}`);
        });

        // Wait for the web server to come online within specified timeout
        this.pollServer((err) => {
          if (err) throw new Error(err);

          this.takeScreenshot(commit, () => {
            this.timer(commit.hash, true);
            this.log(`Done. Shutting down server.\n`);

            spawnSync('sh', ['-c', 'kill -INT -' + server.pid], {
              cwd: this.config.repo,
              stdio: 'pipe',
              encoding: 'utf-8'
            });

            this._processCommits();
          });
        });
      });
    });
  }
}

module.exports = GitLapse;
