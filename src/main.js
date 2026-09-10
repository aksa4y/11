function showScreen(id)
{
 document.querySelectorAll('.screen').forEach(function (screen) { screen.classList.toggle('is-active', screen.id === id); });
 document.getElementById('btn-pause').hidden = id !== 'screen-game';
}
function updateHud()
{
 document.getElementById('score').textContent = Game.score.toLocaleString('ru');
 document.getElementById('lives').textContent = '♥ '.repeat(Math.max(0, Game.lives)) + '♡ '.repeat(3 - Math.max(0, Game.lives));
 document.getElementById('combo').textContent = Game.combo > 1 ? 'КОМБО ' + Game.combo + ' / ×' + Math.min(CONFIG.MAX_MULTIPLIER, 1 + Math.floor(Game.combo / 8)) : '';
 document.getElementById('track-title').textContent = Game.level.name + ' · ' + Game.level.bpm + ' BPM';
}
function updateMenu()
{
 var level = CONFIG.LEVELS[Game.levelIndex], complete = Progress.get('completed') || {};
 document.getElementById('level-number').textContent = 'УРОВЕНЬ ' + String(Game.levelIndex + 1).padStart(2, '0') + ' / 12' + (complete[Game.levelIndex] ? ' ✓' : '');
 document.getElementById('level-name').textContent = level.name;
 document.getElementById('level-meta').textContent = level.bpm + ' BPM · ' + Math.round(level.beats * 60 / level.bpm) + ' СЕК · ' + (Game.levelIndex < 3 ? 'ЛЕГКО' : Game.levelIndex < 8 ? 'СРЕДНЕ' : 'СЛОЖНО');
 document.getElementById('world-name').textContent = CONFIG.WORLDS[level.world];
 document.getElementById('menu-record').textContent = 'ЛИЧНЫЙ РЕКОРД  /  ' + Progress.get('highScore').toLocaleString('ru');
}
var starting = false;
function startGame()
{
 if (starting || Ads.busy) return;
 starting = true;
 // Новый контекст убирает ноты предыдущей попытки из очереди.
 var closing = Music.context ? Music.context.close() : Promise.resolve();
 closing.then(function ()
 {
  Music.context = null;
  return Music.init();
 }).then(function () { Game.lastBad = -10; Game.start(); }).catch(function ()
 {
  document.getElementById('menu-record').textContent = 'Звук недоступен. Открой игру в современном браузере.';
 }).finally(function () { starting = false; });
}
function toMenu()
{
 if (Ads.busy || Game.resuming) return;
 Game.state = 'menu'; if (Music.context) Music.context.suspend(); YandexSDK.gameplayStop(); updateMenu(); showScreen('screen-menu');
}
function bind(id, fn) { document.getElementById(id).addEventListener('click', fn); }
Progress.load();
Music.muted = !!Progress.get('muted');
function soundLabel()
{
 document.getElementById('btn-sound').textContent = Music.muted ? '♪̸' : '♫';
 document.getElementById('btn-sound').setAttribute('aria-label', Music.muted ? 'Включить звук' : 'Выключить звук');
}
soundLabel(); updateMenu(); Render.init();
bind('btn-play', startGame);
bind('btn-restart', function () { Ads.between(startGame); });
bind('btn-revive', function () { Ads.reward(); });
bind('btn-ready', function ()
{
 if (Ads.busy || Game.state !== 'ready') return;
 var action = Ads.nextAction; Ads.nextAction = null;
 if (action) action();
});
bind('btn-pause', function () { Game.pause(); }); bind('btn-resume', function () { Game.resume(); });
bind('btn-menu', function () { Ads.between(toMenu); }); bind('btn-pause-menu', toMenu);
bind('btn-next', function () { Ads.between(function () { Game.levelIndex = Math.min(11, Game.levelIndex + 1); startGame(); }); });
bind('level-prev', function () { Game.levelIndex = (Game.levelIndex + 11) % 12; updateMenu(); });
bind('level-next', function () { Game.levelIndex = (Game.levelIndex + 1) % 12; updateMenu(); });
bind('btn-sound', function () { Music.mute(); soundLabel(); });
document.getElementById('screen-game').addEventListener('pointerdown', function (event)
{
 event.preventDefault(); Game.jump();
});
document.addEventListener('keydown', function (event)
{
 if (event.code === 'Space' && Game.state === 'playing') { event.preventDefault(); if (!event.repeat) Game.jump(); }
 if (event.code === 'Escape') { if (Game.state === 'playing') Game.pause(); else if (Game.state === 'paused') Game.resume(); }
});
document.addEventListener('visibilitychange', function () { if (document.hidden) Game.pause(); });
window.addEventListener('blur', function () { Game.pause(); });
document.addEventListener('contextmenu', function (event) { event.preventDefault(); });
function frame(now) { Game.update(); Render.draw(now); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
// SDK загружается независимо: локальный запуск доступен без платформы.
if (location.protocol !== 'file:' && !['localhost', '127.0.0.1'].includes(location.hostname))
{
 Ads.sdkLoading = true;
 var sdkScript = document.createElement('script'); sdkScript.src = '/sdk.js'; sdkScript.async = true;
 sdkScript.onload = function ()
 {
  YandexSDK.init(function ()
  {
   YandexSDK.notifyReady();
   Ads.sdkLoading = false; Ads.refreshOffer();
   if (Game.state === 'playing') YandexSDK.gameplayStart();
   if (YandexSDK.ysdk && YandexSDK.ysdk.on)
    YandexSDK.ysdk.on('game_api_pause', function () { Game.pause(); });
  });
 };
 sdkScript.onerror = function () { Ads.sdkLoading = false; Ads.refreshOffer(); };
 document.head.appendChild(sdkScript);
}
