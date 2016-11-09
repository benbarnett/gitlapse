'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

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

    expect(instantiatedGitLapse.config.startRevision).to.equal('abcde');
    expect(instantiatedGitLapse.config.endRevision).to.equal('fghij');
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
