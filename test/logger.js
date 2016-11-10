'use strict';

let chai = require('chai');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
let expect = chai.expect;

chai.use(sinonChai);

describe('Logs things when asked to', function() {
  let logger = require('../lib/logger');

  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function(){
    this.sinon.restore();
  });

  it('is not in debug mode by default', function() {
    expect(logger.debug).to.be.falsey;
  });

  it('runs console.log when in debug mode', function() {
    let consoleLog = this.sinon.stub(console, 'log');
    logger.debug = true;
    logger.log('test');

    expect(consoleLog).to.have.been.calledWith('test');
  });

  it('does not run console.log when not in debug', function() {
    let consoleLog = this.sinon.stub(console, 'log');
    logger.debug = false;
    logger.log('test');

    expect(consoleLog).to.not.have.been.calledWith('test');
  });
});
