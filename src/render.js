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
 backdrop: function (c, w, h, theme, hue)
 {
  c.save(); c.strokeStyle = 'hsla(' + hue + ',90%,75%,.24)'; c.fillStyle = 'hsla(' + hue + ',90%,70%,.16)'; c.lineWidth = 1.5;
  var x = w * .5, y = h * .32;
  if (theme.pattern === 'waves')
  {
   for (var n = 0; n < 9; n++)
   {
    c.beginPath();
    for (var px = 0; px <= w; px += 8)
    {
     var py = y + n * h * .045 + Math.sin(px / w * 9 + n * .5) * h * .025;
     if (px === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.stroke();
   }
  }
  else if (theme.pattern === 'grid')
  {
   for (var i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(x + i * w * .012, y); c.lineTo(x + i * w * .16, h); c.stroke(); }
   for (var j = 0; j < 11; j++) { var gy = y + Math.pow(j / 10, 2) * (h - y); c.beginPath(); c.moveTo(0, gy); c.lineTo(w, gy); c.stroke(); }
  }
  else if (theme.pattern === 'sun')
  {
   c.beginPath(); c.arc(x, y, h * .19, 0, Math.PI * 2); c.clip();
   for (var stripe = 0; stripe < 16; stripe++) c.fillRect(x - h * .22, y - h * .20 + stripe * h * .027, h * .44, h * .019);
  }
  else
  {
   for (var r = 0; r < 3; r++) { c.beginPath(); c.arc(x, y, h * (.13 + r * .03), 0, Math.PI * 2); c.stroke(); }
  }
  c.restore();
 },
 ball: function (c, x, y, radius, skin)
 {
  var hue = skin.hue;
  c.save(); c.shadowColor = 'hsl(' + hue + ',90%,65%)'; c.shadowBlur = radius;
  var fill = c.createRadialGradient(x - radius * .35, y - radius * .45, 1, x, y, radius);
  fill.addColorStop(0, skin.pattern === 'cracks' ? '#b25922' : '#ffffff');
  fill.addColorStop(.4, 'hsl(' + hue + ',80%,' + (skin.pattern === 'cracks' ? 20 : 85) + '%)');
  fill.addColorStop(1, 'hsl(' + hue + ',75%,' + (skin.pattern === 'cracks' ? 7 : 40) + '%)');
  c.fillStyle = fill; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
  c.save(); c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.clip();
  c.strokeStyle = skin.pattern === 'cracks' ? '#ffb05c' : '#ffffffb0'; c.lineWidth = Math.max(1.3, radius * .045);
  if (['ring', 'bands', 'orbit'].includes(skin.pattern))
  {
   c.beginPath(); c.ellipse(x, y + radius * .2, radius * .94, radius * .27, -.3, 0, Math.PI * 2); c.stroke();
   if (skin.pattern !== 'ring') { c.beginPath(); c.ellipse(x, y - radius * .25, radius, radius * .29, skin.pattern === 'orbit' ? 1.1 : -.3, 0, Math.PI * 2); c.stroke(); }
  }
  else if (skin.pattern === 'rays')
  {
   for (var n = 0; n < 12; n++) { var angle = n * Math.PI / 6; c.beginPath(); c.moveTo(x + Math.cos(angle) * radius * .38, y + Math.sin(angle) * radius * .38); c.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius); c.stroke(); }
  }
  else if (skin.pattern === 'facets')
  {
   c.beginPath(); c.moveTo(x, y - radius); c.lineTo(x + radius * .65, y); c.lineTo(x, y + radius); c.lineTo(x - radius * .65, y); c.closePath(); c.moveTo(x - radius, y); c.lineTo(x + radius, y); c.moveTo(x, y - radius); c.lineTo(x, y + radius); c.stroke();
  }
  else
  {
   for (var k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x - radius + k * radius * .5, y - radius); c.lineTo(x - radius * .7 + k * radius * .4, y - radius * .2); c.lineTo(x - radius + k * radius * .4, y + radius * .3); c.lineTo(x - radius * .5 + k * radius * .4, y + radius); c.stroke(); }
  }
  c.restore(); c.restore();
 },
 preview: function (canvas, skin, theme)
 {
  var c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  var hue = theme.hue === null ? CONFIG.HUES[CONFIG.LEVELS[Game.levelIndex].world] : theme.hue;
  var gradient = c.createLinearGradient(0, 0, 0, h); gradient.addColorStop(0, 'hsl(' + hue + ',60%,7%)'); gradient.addColorStop(1, 'hsl(' + hue + ',65%,23%)');
  c.fillStyle = gradient; c.fillRect(0, 0, w, h); this.backdrop(c, w, h, theme, hue);
  c.fillStyle = 'hsla(' + hue + ',90%,75%,.25)'; c.beginPath(); c.ellipse(w * .5, h * .83, h * .22, h * .045, 0, 0, Math.PI * 2); c.fill();
  this.ball(c, w * .5, h * .53, h * .23, skin);
 },
 draw: function (now)
 {
  var c = this.ctx, w = this.width, h = this.height;
  var menu = Game.state === 'menu', mobile = w < 700;
  var center = menu && !mobile ? w * .70 : w * .5;
  var horizon = h * (menu && mobile ? .17 : .30);
  var theme = Shop.background();
  var hue = theme.hue === null ? CONFIG.HUES[CONFIG.LEVELS[Game.levelIndex].world] : theme.hue;
  var time = Game.state === 'playing' || Game.state === 'paused' ? Game.time() : now / 1000;
  var beat = Game.interval ? time / Game.interval - 4 : time * .8;
  var color = function (s, l, a) { return 'hsla(' + hue + ',' + s + '%,' + l + '%,' + (a === undefined ? 1 : a) + ')'; };
  var bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, color(50, 7)); bg.addColorStop(.5, color(62, 19)); bg.addColorStop(1, color(65, 5)); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  var glow = c.createRadialGradient(center, horizon, 0, center, horizon, h * .7);
  glow.addColorStop(0, color(90, 70, .38)); glow.addColorStop(.45, color(80, 50, .08)); glow.addColorStop(1, color(70, 30, 0)); c.fillStyle = glow; c.fillRect(0, 0, w, h);
  c.save(); c.translate(center - w * .5, horizon - h * .32);
  this.backdrop(c, w, h, theme, hue); c.restore();
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
  this.ball(c, bx, by, radius, Shop.skin());
  if (menu)
  {
   var veil = c.createLinearGradient(0, 0, mobile ? 0 : w * .62, mobile ? h : 0);
   veil.addColorStop(0, color(60, 6, mobile ? 0 : .95)); veil.addColorStop(1, color(60, 6, mobile ? .96 : 0)); c.fillStyle = veil; c.fillRect(0, 0, w, h);
  }
 }
};
