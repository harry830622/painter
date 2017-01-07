const pixi = require('pixi.js');

const renderer = pixi.autoDetectRenderer(3840, 2160, { antialias: true });
document.querySelector('#pixi').appendChild(renderer.view);
