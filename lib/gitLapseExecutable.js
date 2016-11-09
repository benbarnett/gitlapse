'use strict';

var program = require('commander');
var path = require('path');
var GitLapse = require('../lib/index');

module.exports = {
  init: function(args) {
    this.runWith(args);
  },
  runWith: function(args) {
    this.program().parse(args);
  },
  program: function() {
    return this._program = this._program || program
      .version('1.0.0')
      .arguments('<start-revision>..<end-revision> [steps]')
      .option('-c, --config <path>', 'Path to GitLapse config', 'gitlapse.json')
      .option('-d --debug', 'Run in debug mode (makes things chatty in stdout)', false)
      .action(this.action);
  },
  loadConfig: function() {
    var config;


  },
  action: function(range, steps) {
    let config;

    try {
      config = require(path.resolve(program.config));
    } catch(e) {
      throw new Error(`Unable to load gitlapse config from ${path.resolve(program.config)}`, e);
      process.exit(1);
    }

    let revisions = range.split('..');
    let gitLapse = new GitLapse(Object.assign({
      startRevision: revisions[0],
      endRevision: revisions[1],
      steps: parseFloat(steps) || 1,
      debug: program.debug
    }, config));

    return gitLapse.go();
  }
};
