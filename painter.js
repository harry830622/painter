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
  const { from, to } = line;
  const pen = new pixi.Graphics();
  pen.lineStyle(line.width, line.color)
    .moveTo(from.x, maxY - from.y)
    .lineTo(to.y, maxY - to.y);

  return pen;
}

function createRect(rect) {
  const { lower_left, upper_right } = rect;
  const width = upper_right.x - lower_left.x;
  const height = upper_right.y - lower_left.y;

  const pen = new pixi.Graphics();
  pen
    .lineStyle(5, 0x000000)
    .beginFill(rect.color)
    .drawRect(lower_left.x, maxY - upper_right.y, width, height)
    .endFill();

  return pen;
}

function createPolygon(polygon) {
  const pen = new pixi.Graphics();
  const points = polygon.points.map(({ x, y }) => new pixi.Point(x, maxY - y));
  pen
    .lineStyle(5, 0x000000)
    .beginFill(polygon.color)
    .drawPolygon(points)
    .endFill();

  return pen;
}

function create(object) {
  switch (object.type) {
    case 'line': {
      const line = object;
      return createLine(line);
    }
    case 'rect': {
      const rect = object;
      return createRect(rect);
    }
    case 'polygon': {
      const polygon = object;
      return createPolygon(polygon);
    }
    default: { break; }
  }

  return undefined;
}

function draw(graphic) {
  const painting = new pixi.Graphics();

  graphic.objects.forEach((object) => {
    switch (object.type) {
      case 'line': {
        const line = object;
        const { from, to } = line;

        updateBoundingBox({ x: from.x, y: from.y }, { x: to.x, y: to.y });

        break;
      }
      case 'rect': {
        const rect = object;
        const { lower_left, upper_right } = rect;

        updateBoundingBox(lower_left, upper_right);

        break;
      }
      case 'polygon': {
        const polygon = object;

        updateBoundingBox(...polygon.points);

        break;
      }
      default: { break; }
    }
  });

  console.log(minX);
  console.log(minY);
  console.log(maxX);
  console.log(maxY);

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
