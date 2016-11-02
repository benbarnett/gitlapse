'use strict';

var git = require('simple-git')();

class GitWalker {
  constructor(config) {
    this.commitIndex = 0;
    this.applyConfig(config);
    return this;
  }

  init(done) {
    git.cwd(this.config.repo, () => {
      git.log(['--reverse',
        '--ancestry-path',
        `${this.config['start-commit']}^..${this.config['end-commit']}`],
        (err, log) => {
          if (err) {
            throw new Error(err);
          }

          this.commits = log.all;

          done();
        });
    });
  }

  applyConfig(config) {
    this.config = Object.assign({
      repo: __dirname,
      'start-commit': '',
      'end-commit': '',
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

module.exports = function(config) {
  return new GitWalker(config);
};
