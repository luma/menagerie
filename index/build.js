#!/usr/bin/env node
'use strict';
const bluebird = require('bluebird');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const mkdirp = bluebird.promisify(fs.mkdirs);
const writeFile = bluebird.promisify(fs.writeFile);
const readFile = bluebird.promisify(fs.readFile);
const copyDir = bluebird.promisify(fs.copy);
const readDirAux = bluebird.promisify(fs.readdir);
const markdown = require('markdown').markdown;
const Path = require('path');

// Collect all dir names on path excluding '.'
const readDir = (path) => {
  return readDirAux(path).then((files) => {
    return files.filter((file) => {
      if (file === '.') {
        return false;
      }

      const stat = fs.statSync(Path.join(path, file));
      return stat.isDirectory();
    });
  });
};


function getSections() {
  // return bluebird.resolve([
  //   ['./index.html', 'Hello!', 'active'],
  //   ['./software_development_practices/index.html', 'Software development practices'],
  //   ['./distributed_systems/index.html', 'Distributed systems'],
  // ]);

  return readDir('./sections').then((dirs) => {
    return dirs.map((dir) => {
      const metaPath = Path.join('../sections', dir, 'book.json');
      return [Path.join(dir, '/index.html'), require(metaPath).title];
    });
  }).then((dirs) => {
    // Add the index page
    dirs.unshift(['./index.html', 'Hello!', 'active']);
    return dirs;
  });
}


function buildTOC() {
  return getSections().then(function(sections) {
    const sectionHtml = sections.map((params, index) => {
      const url = params[0];
      const title = params[1];
      const className = params[2] ? ` class="${params[2]}"` : '';

      return `<li><a href="${url}"${className}><strong>${index}.</strong> ${title}</a></li>`;
    }).join('');

    return `<ul class="chapter">${sectionHtml}</ul>`;
  });
}


bluebird.all([
  mkdirp('./book'),
  readFile('./index/index.md', 'utf8').then((indexMd) => {
    return markdown.toHTML(indexMd);
  }),
  readFile('./index/theme/index.hbs', 'utf8').then((indexHbs) => {
    return Handlebars.compile(indexHbs);
  }),

  buildTOC(),
]).then((r) => {
  const template = r[2];
  const indexHtml = template({
    title: 'Menagerie',
    content: r[1],
    toc: r[3],
  });

  return [
    copyDir('./index/theme/assets', './book/assets', { clobber: true }),
    writeFile('./book/index.html', indexHtml),
  ];
}).then(() => {
  console.log('Created ./book/index.html');
});
