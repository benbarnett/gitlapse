'use strict';

var fs = require('fs');
var path = require('path');
var mu = require('mu2');
var pump = require('pump');

class Slideshow {
  constructor(slides, config) {
    this.slides = slides || [];
    this.config = Object.assign({
      speed: 3000,
      output: 'dist',
      filename: 'index.html',
      templates: __dirname + '/../templates',
      template: 'slideshow.html'
    }, config);

    mu.root = path.resolve(this.config.templates);

    return this;
  }

  save(done) {
    var source = mu.compileAndRender(this.config.template, {
      slides: this.generateSlidesHTML()
    });

    var dest = fs.createWriteStream(path.resolve(`${this.config.output}/${this.config.filename}`));

    pump(source, dest, done);
  }

  generateSlidesHTML() {
    var html = '';

    this.slides.forEach(function(slide) {
      html += `
      <figure>
        <img src="${slide.src}" width="100%" />
        <figcaption>${slide.caption}.</figcaption>
      </figure>
      `;
    });

    return html;
  }
}

module.exports = Slideshow;
