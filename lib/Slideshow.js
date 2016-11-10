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
      template: 'slideshow.html',
      width: 1920,
      height: 1200,
      name: 'Gitlapse Project'
    }, config);

    mu.root = path.resolve(this.config.templates);

    return this;
  }

  save(done) {
    var source = this.templateRenderer();

    var dest = fs.createWriteStream(path.resolve(`${this.config.output}/${this.config.filename}`));

    pump(source, dest, done);
  }

  templateRenderer() {
    return mu.compileAndRender(this.config.template, {
      slides: this.generateSlidesHTML(),
      name: this.config.name,
      width: this.config.width,
      height: this.config.height
    });
  }

  generateSlidesHTML() {
    var html = '';

    this.slides.forEach(function(slide) {
      html += `
        <img src="${slide.src}" />
      `;
    });

    return html;
  }
}

module.exports = Slideshow;
