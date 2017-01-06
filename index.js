const { dialog } = require('electron').remote;

const fs = require('fs');
const d3 = require('d3');

const canvas = d3.select('canvas');
const context = canvas.node().getContext('2d');
const width = canvas.property('width');
const height = canvas.property('height');

const lines = [];
let minX = Number.MAX_VALUE;
let maxX = Number.MIN_VALUE;
let minY = Number.MAX_VALUE;
let maxY = Number.MIN_VALUE;

function drawLine({ color, from, to }) {
  const ratio = height / (maxY - minY) * 2;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(from.x * ratio, from.y * ratio);
  context.lineTo(to.x * ratio, to.y * ratio);
  context.stroke();
}

function drawLines() {
  lines.forEach(drawLine);
}

function parse(data) {
  const tokens = data.split('\n').map(line => line.split(' '));
  tokens.forEach((line) => {
    if (line[0] === 'line') {
      const color = line[1];
      const x1 = line[2];
      const y1 = line[3];
      const x2 = line[4];
      const y2 = line[5];
      minX = Math.min(minX, Math.min(x1, x2));
      maxX = Math.max(maxX, Math.max(x1, x2));
      minY = Math.min(minY, Math.min(y1, y2));
      maxY = Math.max(maxY, Math.max(y1, y2));
      lines.push({
        color,
        from: { x: x1, y: y1 },
        to: { x: x2, y: y2 },
      });
    }
  });
  context.save();
  context.clearRect(0, 0, width, height);
  drawLines();
  context.restore();
}

const btn = document.querySelector('#open-file .button');
btn.addEventListener('click', (e) => {
  dialog.showOpenDialog({ properties: ['openFile'] }, (filenames) => {
    const file_name = filenames[0];
    fs.readFile(file_name, 'utf-8', (err, data) => {
      parse(data);
    });
  });
  e.preventDefault();
}, false);

function zoomed() {
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(d3.event.transform.x, d3.event.transform.y);
  context.scale(d3.event.transform.k, d3.event.transform.k);
  drawLines();
  context.restore();
}

canvas
  .call(d3.zoom().scaleExtent([1 / 2, 10])
  .on('zoom', zoomed));
