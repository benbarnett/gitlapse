'use strict';

var expect = require('chai').expect;
var events = require('events');
var util = require('util');
var proxyquire = require('proxyquire');

describe('Generating image slideshows', function() {
  it('prepares markup for the slides', function() {
    var Slideshow = require('../lib/Slideshow');
    var slides = [
      {
        src: 'test1.png',
        caption: 'testing1'
      },
      {
        src: 'test2.png',
        caption: 'testing2'
      }
    ];

    var slideshow = new Slideshow(slides);
    var html = slideshow.generateSlidesHTML();

    expect(html).to.have.string(`<img src="${slides[0].src}"`);
    expect(html).to.have.string(`<figcaption>${slides[0].caption}.</figcaption>`);

    expect(html).to.have.string(`<img src="${slides[1].src}"`);
    expect(html).to.have.string(`<figcaption>${slides[1].caption}.</figcaption>`);
  });
});
