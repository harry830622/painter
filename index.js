const { dialog } = require('electron').remote;

const fs = require('fs');

const painter = require('./painter.js');

const openFileBtn = document.querySelector('#open-file');
openFileBtn.addEventListener('click', (e) => {
  dialog.showOpenDialog({ properties: ['openFile'] }, (filenames) => {
    const fileName = filenames[0];

    fs.readFile(fileName, 'utf-8', (err, data) => {
      const painting = JSON.parse(data);
      painter.draw(painting);
    });
  });

  e.preventDefault();
}, false);

const canvas = painter.canvas;
const stage = painter.stage;

canvas.addEventListener('wheel', (e) => {
  const isZoomIn = e.deltaY < 0;
  const direction = isZoomIn ? 1 : -1;
  const factor = 1 + direction * 0.1;

  painter.stage.scale.x *= factor;
  painter.stage.scale.y *= factor;
});

(function pan() {
  let isDragging = false;
  let lastPosition;

  stage.mousedown = (e) => {
    isDragging = true;
    lastPosition = { x: e.data.global.x, y: e.data.global.y };
  };

  stage.mousemove = (e) => {
    if (isDragging) {
      const position = e.data.global;
      const dx = position.x - lastPosition.x;
      const dy = position.y - lastPosition.y;
      stage.position.x += dx;
      stage.position.y += dy;

      lastPosition = { x: position.x, y: position.y };
    }
  };

  stage.mouseup = (e) => {
    isDragging = false;
  };
}());

module.exports = {
  painter,
};
