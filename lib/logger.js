'use strict';

let chalk = require('chalk');

module.exports = {
  debug: false,

  log: function(msg, colour) {
    if (this.debug) {
      let str = colour ? chalk[colour](msg) : msg;
      console.log(str);
    }
  },

  timer: function(id, finished) {
    if (this.debug) console[finished ? 'timeEnd' : 'time'](id);
  }
}
