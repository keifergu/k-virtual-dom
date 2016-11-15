var diff = require('./diff');
var el = require('./element');
var patch = require('./patch');

var ul = el('ul', {id: 'list'}, [
  el('li', {class: 'item'}, ['Item 1']),
  el('li', {style: 'color: yellow'}, ['Item 2']),
  el('li', {class: 'item'}, ['Item 3'])
])

var newul = el('ul', {id: 'list'}, [
  el('li', {class: 'item'}, ['new Item']),
  el('li', {style: 'color: blue'}, ['Item 2']),
  el('ul', {class: 'item'}, [
  	el('li',{},["Children item"]),
  	]),
]);

var ulRoot = ul.render();
document.body.appendChild(ulRoot);

setInterval(patch(ulRoot, diff(ul, newul)), 50000);