'use strict';

var git = require('simple-git')();

class GitWalker {
  constructor(config) {
    this.commitIndex = 0;
    this.applyConfig(config);
    return this;
  }

  init(done) {
    git.cwd(this.config.repo, (err) => {
      if (err) return done(err);

      git.log(['--reverse',
        '--ancestry-path',
        `${this.config['start-revision']}^..${this.config['end-revision']}`],
        (err, log) => {
          if (err) return done(err);

          this.commits = log.all;
          done();
        });
    });
  }

  applyConfig(config) {
    this.config = Object.assign({
      repo: __dirname,
      'start-revision': '',
      'end-revision': '',
      steps: 1
    }, config);
  }

  reset() {
    this.commitIndex = 0;
    return this;
  }

  nextCommit() {
    var commit;

    if (this.commitIndex < this.commits.length) {
      commit = this.commits[this.commitIndex];
      this.commitIndex += this.config.steps;
    }

    return commit;
  }

  checkoutNextCommit(done) {
    var commit = this.nextCommit();
    if (!commit) return done(null, 'FINISHED');

    git.checkout(commit.hash, (err, log) => {
      done(err, log, commit)
    });
  }
}

module.exports = GitWalker;
