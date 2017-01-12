const pixi = require('pixi.js');

const canvasWidth = 1920;
const canvasHeight = 1080;

const renderer = pixi.autoDetectRenderer(canvasWidth, canvasHeight, {
  antialias: true,
});

renderer.backgroundColor = 0xFFFFFF;

document.querySelector('#pixi').appendChild(renderer.view);

const stage = new pixi.Container();
stage.interactive = true;

const maxLength = 1000000;
const transparentBackground = new pixi.Graphics();
transparentBackground
  .beginFill(0x000000, 0)
  .drawRect(0, 0, maxLength, maxLength)
  .endFill();

const renderTexture =
  pixi.RenderTexture.create(maxLength, maxLength);
renderer.render(transparentBackground, renderTexture);

const transparentSprite = new pixi.Sprite(renderTexture);
transparentSprite.position.x = -1 * maxLength / 2;
transparentSprite.position.y = -1 * maxLength / 2;
stage.addChild(transparentSprite);

let minX = Number.MAX_VALUE;
let minY = Number.MAX_VALUE;
let maxX = Number.MIN_VALUE;
let maxY = Number.MIN_VALUE;

function updateBoundingBox(...points) {
  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
}

function createLine(line) {
  const xFrom = line.from.x;
  const yFrom = line.from.y;
  const xTo = line.to.x;
  const yTo = line.to.y;

  updateBoundingBox({ x: xFrom, y: yFrom }, { x: xTo, y: yTo });

  const pen = new pixi.Graphics();
  pen.lineStyle(line.width, line.color)
    .moveTo(xFrom, yFrom)
    .lineTo(xTo, yTo);

  return pen;
}

function createPolygon(polygon) {
  const pen = new pixi.Graphics();

  if (polygon.points) {
    polygon.points.forEach((point) => {
      updateBoundingBox(point);
    });

    const points = polygon.points.map(({ x, y }) => new pixi.Point(x, y));
    pen
      .lineStyle(1, 0x000000)
      .beginFill(polygon.color)
      .drawPolygon(points)
      .endFill();
  }

  return pen;
}

function create(shape) {
  switch (shape.type) {
    case 'line': {
      const line = shape;
      return createLine(line);
    }
    case 'polygon': {
      const polygon = shape;
      return createPolygon(polygon);
    }
    default: { break; }
  }

  return undefined;
}

function draw(graphic) {
  const painting = new pixi.Graphics();

  graphic.objects.map(create).forEach((pen) => {
    painting.addChild(pen);
  });

  stage.addChild(painting);

  const paintingWidth = maxX - minX;
  const paintingHeight = maxY - minY;
  const halfPaintingWidth = paintingWidth / 2;
  const halfPaintingHeight = paintingHeight / 2;
  const scale = canvasHeight / paintingHeight;

  stage.scale.x = scale * 0.9;
  stage.scale.y = scale * 0.9;
  stage.position.x = halfPaintingWidth * scale;
  stage.position.y = halfPaintingHeight * scale;
}

function animate() {
  renderer.render(stage);

  requestAnimationFrame(animate);
}

animate();

module.exports = {
  stage,
  draw,
  canvas: renderer.view,
};
