'use strict';

const FIXTURE_REPO = __dirname + '/fixtures/gitlapse-test';

var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var git = require('simple-git')(FIXTURE_REPO);
var testConfig = {
  'scripts': {
    'setup': 'test/fixtures/setup.sh',
    'server': 'test/fixtures/server.sh'
  },
  'uri': 'http://localhost:8080',
  'repo': `${FIXTURE_REPO}`,
};

describe('Walking the git repository', function() {
  var GitWalker = require('../lib/GitWalker');
  var gitWalker = new GitWalker();

  it('builds a list of commits within the range', function(done) {
    gitWalker.applyConfig(Object.assign({
      'start-revision': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-revision': '513b6013019185fd968b29db0058daf2215c8064'
    }, testConfig));

    gitWalker.reset().init(() => {
      expect(gitWalker.nextCommit().hash).to.equal('932ad002c1d98b9704efed2f860f1a6e1a7b0e9d');
      expect(gitWalker.nextCommit().hash).to.equal('802d934188885725fa947560fc84751e7fe7c938');
      expect(gitWalker.nextCommit().hash).to.equal('513b6013019185fd968b29db0058daf2215c8064');
      expect(gitWalker.nextCommit()).to.not.exist;

      done();
    });
  });

  it('jumps commits by the number of steps supplied', function(done) {
    gitWalker.applyConfig(Object.assign({
      'start-revision': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-revision': '513b6013019185fd968b29db0058daf2215c8064',
      steps: 2
    }, testConfig));

    gitWalker.reset().init(() => {
      expect(gitWalker.nextCommit().hash).to.equal('932ad002c1d98b9704efed2f860f1a6e1a7b0e9d');
      expect(gitWalker.nextCommit().hash).to.equal('513b6013019185fd968b29db0058daf2215c8064');

      done();
    });
  });

  it('checks out the commits in the repository', function(done) {
    gitWalker.applyConfig(Object.assign({
      'start-revision': '932ad002c1d98b9704efed2f860f1a6e1a7b0e9d',
      'end-revision': '513b6013019185fd968b29db0058daf2215c8064'
    }, testConfig));

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

describe('The executable passes in the config', function() {
  beforeEach(function() {
    var name = require.resolve('commander');
    delete require.cache[name];

    this.sinon = sinon.sandbox.create();
  });

  afterEach(function(){
    this.sinon.restore();
  });

  // Fake running the gitlapse from the command line
  function runGitLapseExecutableStub(args) {
    var gitLapseStub = require('./fixtures/gitLapseStub');
    var gitLapseExecutable = proxyquire('../lib/gitLapseExecutable', {' ../lib/index': gitLapseStub });
    var actionSpy = this.sinon.spy(gitLapseExecutable, 'action');
    var _args = ['node', '../bin/gitlapse'].concat(args);

    gitLapseExecutable.init(_args);

    return {
      instantiatedGitLapse: actionSpy.returnValues[0],
      gitLapseExecutable: gitLapseExecutable
    };
  }

  it('passes through the commit range', function() {
    var args = ['abcde..fghij'];
    var instantiatedGitLapse = runGitLapseExecutableStub.call(this, args).instantiatedGitLapse;

    expect(instantiatedGitLapse.config).to.have.property('start-revision', 'abcde');
    expect(instantiatedGitLapse.config).to.have.property('end-revision', 'fghij');
  });

  it('passes through the steps option', function() {
    var args = ['abcde..fghij', 15];
    var instantiatedGitLapse = runGitLapseExecutableStub.call(this, args).instantiatedGitLapse;

    expect(instantiatedGitLapse.config).to.have.property('steps', 15);
  });

  it('sets the path to the configuration file from option', function() {
    var args = ['abcde..fghij', '--config', './test/fixtures/test-config.json'];
    var gitLapseExecutable = runGitLapseExecutableStub.call(this, args).gitLapseExecutable;

    expect(gitLapseExecutable.program().config).to.equal('./test/fixtures/test-config.json');
  });

  it('applies the options from the specified config file', function() {
    var args = ['abcde..fghij', '--config', './test/fixtures/test-config.json'];
    var instantiatedGitLapse = runGitLapseExecutableStub.call(this, args).instantiatedGitLapse;

    expect(instantiatedGitLapse.config.scripts).to.eql({
      "setup": "test/fixtures/setup.sh",
      "server": "test/fixtures/server.sh"
    });
  });
});
