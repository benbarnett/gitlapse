'use strict';

const FIXTURE_REPO = __dirname + '/fixtures/gitlapse-test';

var expect = require('chai').expect;
var git = require('simple-git')(FIXTURE_REPO);

describe('Walking the git repository', function() {
  var gitWalker = require('../lib/gitWalker')();

  it('builds a list of commits within the range', function(done) {
    gitWalker.applyConfig({
      repo: `${FIXTURE_REPO}`,
      'start-commit': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-commit': '513b6013019185fd968b29db0058daf2215c8064',
      steps: 1
    });

    gitWalker.reset().init(() => {
      expect(gitWalker.nextCommit().hash).to.equal('932ad002c1d98b9704efed2f860f1a6e1a7b0e9d');
      expect(gitWalker.nextCommit().hash).to.equal('802d934188885725fa947560fc84751e7fe7c938');
      expect(gitWalker.nextCommit().hash).to.equal('513b6013019185fd968b29db0058daf2215c8064');
      expect(gitWalker.nextCommit()).to.not.exist;

      done();
    });
  });

  it('jumps commits by the number of steps supplied', function(done) {
    gitWalker.applyConfig({
      repo: `${FIXTURE_REPO}`,
      'start-commit': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-commit': '513b6013019185fd968b29db0058daf2215c8064',
      steps: 2
    });

    gitWalker.reset().init(() => {
      expect(gitWalker.nextCommit().hash).to.equal('932ad002c1d98b9704efed2f860f1a6e1a7b0e9d');
      expect(gitWalker.nextCommit().hash).to.equal('513b6013019185fd968b29db0058daf2215c8064');

      done();
    });
  });

  it('checks out the commits in the repository', function(done) {
    gitWalker.applyConfig({
      repo: `${FIXTURE_REPO}`,
      'start-commit': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-commit': '513b6013019185fd968b29db0058daf2215c8064',
      steps: 1
    });

    gitWalker.reset().init(() => {
      gitWalker.checkoutNextCommit(() => {
        git.revparse(['HEAD'], function(err, output) {
          expect(output).to.include('932ad002c1d98b9704efed2f860f1a6e1a7b0e9d');
          done();
        });
      });
    });
  });
});
