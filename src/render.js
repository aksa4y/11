var Render =
{
 canvas: null, ctx: null, width: 0, height: 0,
 init: function ()
 {
  this.canvas = document.getElementById('game-canvas'); this.ctx = this.canvas.getContext('2d');
  this.resize(); window.addEventListener('resize', this.resize.bind(this));
 },
 resize: function ()
 {
  this.width = innerWidth; this.height = innerHeight;
  var ratio = Math.min(devicePixelRatio || 1, 2);
  this.canvas.width = this.width * ratio; this.canvas.height = this.height * ratio;
  this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
 },
 polygon: function (points, fill, stroke)
 {
  var c = this.ctx; c.beginPath(); c.moveTo(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
  c.closePath(); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
 },
 draw: function (now)
 {
  var c = this.ctx, w = this.width, h = this.height;
  var menu = Game.state === 'menu', mobile = w < 700;
  var center = menu && !mobile ? w * .70 : w * .5;
  var horizon = h * (menu && mobile ? .17 : .30);
  var hue = CONFIG.HUES[CONFIG.LEVELS[Game.levelIndex].world];
  var time = Game.state === 'playing' || Game.state === 'paused' ? Game.time() : now / 1000;
  var beat = Game.interval ? time / Game.interval - 4 : time * .8;
  var color = function (s, l, a) { return 'hsla(' + hue + ',' + s + '%,' + l + '%,' + (a === undefined ? 1 : a) + ')'; };
  var bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, color(50, 7)); bg.addColorStop(.5, color(62, 19)); bg.addColorStop(1, color(65, 5)); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  var glow = c.createRadialGradient(center, horizon, 0, center, horizon, h * .7);
  glow.addColorStop(0, color(90, 70, .38)); glow.addColorStop(.45, color(80, 50, .08)); glow.addColorStop(1, color(70, 30, 0)); c.fillStyle = glow; c.fillRect(0, 0, w, h);
  // Геометрический портал и частицы задают глубину игрового мира.
  c.save(); c.translate(center, horizon); c.rotate(-.3); c.scale(1, .93);
  for (var r = 0; r < 3; r++)
  {
   c.beginPath(); c.arc(0, 0, h * (.115 + r * .025), 0, Math.PI * 2); c.strokeStyle = color(80, 80, .14 - r * .035); c.lineWidth = r === 0 ? 2 : 1; c.stroke();
  }
  c.restore();
  for (var n = 0; n < 65; n++)
  {
   var px = (Math.sin(n * 127.1) * .5 + .5) * w;
   var py = ((Math.cos(n * 31.7) * .5 + .5) * h + time * (3 + n % 4)) % h;
   c.fillStyle = color(80, 83, .15 + .3 * Math.pow(Math.sin(time + n), 2)); c.beginPath(); c.arc(px, py, n % 3 === 0 ? 2 : 1, 0, Math.PI * 2); c.fill();
  }
  var width = Math.min(w * .45, h * .57);
  // Боковые кристаллы — геометрия игрового окружения.
  for (var side = -1; side <= 1; side += 2)
   for (var k = 0; k < 8; k++)
   {
    var depth = (k + .3) / 8, sx = center + side * (width * (.40 + depth * .92)), sy = horizon + depth * depth * h * .75;
    var size = 16 + depth * 105, lift = 50 + (k % 3) * 55;
    this.polygon([[sx - size * .34, sy], [sx, sy - lift * depth - 20], [sx + size * .32, sy], [sx, sy + size * .4]], color(45, 10 + k % 3 * 3), color(55, 45, .12));
    this.polygon([[sx, sy - lift * depth - 20], [sx + size * .32, sy], [sx, sy + size * .4]], color(60, 24, .4));
   }
  var base = Math.floor(Math.max(0, beat)), frac = Math.max(0, beat) - base;
  if (menu) { base = Math.floor(time * .45); frac = time * .45 % 1; }
  for (var j = 13; j >= 0; j--)
  {
   var z = j - frac;
   if (z < -.98) continue;
   var scale = 1 / (1 + (z + .7) * .45);
   var y = horizon + scale * h * .52;
   var lane = Game.lane(base + j), x = center + lane * width * scale;
   var tileW = width * .52 * scale, tileH = tileW * .32;
   var front = [[x - tileW / 2, y], [x + tileW / 2, y], [x + tileW * .41, y - tileH], [x - tileW * .41, y - tileH]];
   this.polygon([[x - tileW / 2, y], [x + tileW / 2, y], [x + tileW / 2, y + 16 * scale], [x - tileW / 2, y + 16 * scale]], color(80, 24));
   c.shadowColor = color(95, 60); c.shadowBlur = 14 * scale;
   this.polygon(front, color(75, 55, .5 + scale * .4), color(85, 88, .9)); c.shadowBlur = 0;
   c.fillStyle = color(50, 96, .6); c.beginPath(); c.ellipse(x, y - tileH * .48, tileW * .10, tileH * .14, 0, 0, Math.PI * 2); c.fill();
  }
  var jumpAge = time - Game.lastJump;
  var jump = Math.max(0, Math.min(1, jumpAge / ((Game.interval || .65) * .82)));
  var arc = Math.sin(jump * Math.PI);
  var radius = Math.min(w * .045, 28);
  var progress = 1 - Math.pow(1 - jump, 2);
  var camera = Math.max(0, beat);
  var fromIndex = Math.max(0, Game.lastIndex || 0);
  var toIndex = Game.lastIndex >= 0 ? Game.lastIndex + 1 : 0;
  if (menu) { camera = base + frac; fromIndex = base; toIndex = base + 1; progress = frac; arc = Math.sin(frac * Math.PI); }
  var fromScale = 1 / (1 + (Math.max(-.98, fromIndex - camera) + .7) * .45);
  var toScale = 1 / (1 + (Math.max(-.98, toIndex - camera) + .7) * .45);
  var bx = center + width * (Game.lane(fromIndex) * fromScale * (1 - progress) + Game.lane(toIndex) * toScale * progress);
  var groundY = horizon + h * .52 * (fromScale * (1 - progress) + toScale * progress);
  var by = groundY - width * .52 * (fromScale * (1 - progress) + toScale * progress) * .16 - radius - arc * h * .12;
  c.fillStyle = color(95, 70, .15); c.beginPath(); c.ellipse(bx, groundY - radius * .5, radius * 1.5, radius * .32, 0, 0, Math.PI * 2); c.fill();
  c.shadowColor = color(90, 75); c.shadowBlur = 35;
  var ball = c.createRadialGradient(bx - radius * .35, by - radius * .45, 2, bx, by, radius);
  ball.addColorStop(0, '#ffffff'); ball.addColorStop(.45, '#eaffeb'); ball.addColorStop(1, color(65, 48));
  c.fillStyle = ball; c.beginPath(); c.arc(bx, by, radius, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
  c.strokeStyle = '#ffffffb0'; c.lineWidth = 2; c.beginPath(); c.ellipse(bx, by + radius * .2, radius * .94, radius * .27, -.3, 0, Math.PI * 2); c.stroke();
  if (menu)
  {
   var veil = c.createLinearGradient(0, 0, mobile ? 0 : w * .62, mobile ? h : 0);
   veil.addColorStop(0, color(60, 6, mobile ? 0 : .95)); veil.addColorStop(1, color(60, 6, mobile ? .96 : 0)); c.fillStyle = veil; c.fillRect(0, 0, w, h);
  }
 }
};
