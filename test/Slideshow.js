'use strict';

let expect = require('chai').expect;
let events = require('events');
let util = require('util');
let proxyquire = require('proxyquire');

describe('Generating image slideshows', function() {
  let Slideshow = require('../lib/Slideshow');
  let slides = [
    {
      src: 'test1.png',
      caption: 'testing1'
    },
    {
      src: 'test2.png',
      caption: 'testing2'
    }
  ];

  it('renders the template', function(done) {
    let slideshow = new Slideshow(slides, {
      name: 'testing',
      width: 500,
      height: 300
    });
    let htmlRenderStream = slideshow.templateRenderer();
    let html = '';

    htmlRenderStream.on('data', (chunk) => {
      html += chunk;
    });

    htmlRenderStream.on('end', () => {
      expect(html).to.have.string(`<img src="${slides[0].src}"`);
      expect(html).to.have.string(`<img src="${slides[1].src}"`);
      expect(html).to.have.string(`<title>testing |`);
      expect(html).to.have.string(`data-ratio="500/300"`);

      done();
    });
  });
});
