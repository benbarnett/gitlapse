'use strict';

module.exports = {
  debug: false,

  log: function(msg) {
    if (this.debug) console.log(msg);
  },

  timer: function(id, finished) {
    if (this.debug) console[finished ? 'timeEnd' : 'time'](id);
  }
}
