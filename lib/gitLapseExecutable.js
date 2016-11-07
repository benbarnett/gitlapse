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
      .option('-d --debug <mode>', 'Run in debug mode (makes things chatty in stdout)', false)
      .action(this.action);
  },
  action: function(range, steps) {
    let config = require(path.resolve(program.config));
    let revisions = range.split('..');
    let gitLapse = new GitLapse(Object.assign({
      'start-revision': revisions[0],
      'end-revision': revisions[1],
      steps: steps || 1,
      debug: program.debug
    }, config));

    return gitLapse.go();
  }
};