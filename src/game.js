var Game =
{
 state: 'menu', levelIndex: 0, score: 0, combo: 0, maxCombo: 0, lives: 3, judged: {}, resolved: 0, perfect: 0, lastJump: -10, jumpFrom: 0, jumpTo: 0, feedbackUntil: 0,
 lane: function (index)
 {
  return Math.sin(index * 1.83 + this.levelIndex * .7) * .78;
 },
 time: function () { return Music.context ? Music.context.currentTime - Music.origin : 0; },
 start: function ()
 {
  this.earnedCoins = 0; this.completionPaid = false;
  this.reviveUsed = false; this.revivePending = false; this.attemptCounted = false; this.countInUntil = 0;
  this.level = CONFIG.LEVELS[this.levelIndex]; this.interval = 60 / this.level.bpm;
  this.score = 0; this.combo = 0; this.maxCombo = 0; this.lives = 3; this.judged = {}; this.resolved = 0; this.perfect = 0;
  this.lastIndex = -1; this.jumpFrom = this.lane(0); this.jumpTo = this.lane(0); this.lastJump = -10;
  this.state = 'playing'; Music.nextStep = 0; Music.origin = Music.context.currentTime + .2;
  showScreen('screen-game'); YandexSDK.gameplayStart(); updateHud();
 },
 jump: function ()
 {
  if (this.state !== 'playing') return;
  var t = this.time(), beat = Math.round(t / this.interval), index = beat - 4;
  if (index < 0 || index >= this.level.beats) return;
  if (this.judged[index]) return;
  var error = Math.abs(t - beat * this.interval);
  if (error > this.interval * .30)
  {
   if (t - (this.lastBad || -10) < .18) return;
   this.lastBad = t; this.miss(); return;
  }
  this.judged[index] = true; this.resolved++;
  var perfect = error <= this.interval * .12;
  this.combo++; this.maxCombo = Math.max(this.combo, this.maxCombo);
  if (perfect) this.perfect++;
  var coins = perfect ? CONFIG.COINS_PER_PERFECT : CONFIG.COINS_PER_HIT;
  Progress.addCoins(coins); this.earnedCoins += coins;
  this.score += (perfect ? CONFIG.PERFECT_POINTS : CONFIG.GOOD_POINTS) * Math.min(CONFIG.MAX_MULTIPLIER, 1 + Math.floor(this.combo / 8));
  this.lastIndex = index; this.jumpFrom = this.lane(index); this.jumpTo = this.lane(index + 1); this.lastJump = t;
  this.feedback(perfect ? 'ИДЕАЛЬНО' : 'В РИТМЕ');
  Progress.updateHighScore(this.score); updateHud();
 },
 feedback: function (label)
 {
  document.getElementById('feedback').textContent = label;
  this.feedbackUntil = this.time() + .42;
 },
 miss: function ()
 {
  this.lives--; this.combo = 0; this.feedback('МИМО'); updateHud();
  if (this.lives <= 0) this.finish(false);
 },
 update: function ()
 {
  if (this.state !== 'playing') return;
  Music.tick();
  var t = this.time();
  for (var i = this.resolved; i < this.level.beats; i++)
  {
   if ((i + 4) * this.interval + this.interval * .30 >= t) break;
   if (!this.judged[i])
   {
    this.judged[i] = true; this.resolved++; this.miss();
    if (this.state !== 'playing') return;
   }
  }
  if (t > this.feedbackUntil) document.getElementById('feedback').textContent = '';
  var remaining = Math.ceil(((this.countInUntil || 4 * this.interval) - t) / this.interval);
  document.getElementById('countdown').textContent = remaining > 0 ? (remaining <= 4 ? remaining : '') : '';
  document.getElementById('beat-marker').style.left = (50 + Math.sin(t / this.interval * Math.PI) * 48) + '%';
  document.getElementById('track-progress').style.width = Math.max(0, Math.min(100, (t / this.interval - 4) / this.level.beats * 100)) + '%';
  if (t > (this.level.beats + 4) * this.interval) this.finish(true);
 },
 pause: function ()
 {
  if (this.state !== 'playing') return;
  this.state = 'paused'; document.getElementById('pause-message').textContent = 'Твой ритм никуда не ушёл.'; Music.context.suspend(); YandexSDK.gameplayStop(); showScreen('screen-pause');
 },
 resume: function ()
 {
  if (this.state !== 'paused') return;
  if (this.resuming) return;
  this.resuming = true;
  var pending = this.revivePending;
  var operation = pending ? Music.reset() : Music.context.resume();
  operation.then(function ()
  {
   if (Game.state !== 'paused') return;
   if (pending)
   {
    var next = Game.nextUnjudged();
    Music.origin = Music.context.currentTime - next * Game.interval;
    Music.nextStep = next * 2;
    Game.countInUntil = (next + 4) * Game.interval;
    Game.lastIndex = next - 1; Game.lastJump = -10; Game.lastBad = -10;
    Game.revivePending = false;
   }
   if (document.hidden) { Music.context.suspend(); return; }
   Game.state = 'playing'; showScreen('screen-game'); YandexSDK.gameplayStart();
  }).catch(function () { document.getElementById('pause-message').textContent = 'Не удалось включить звук. Нажми «Продолжить» ещё раз.'; })
   .finally(function () { Game.resuming = false; });
 },
 nextUnjudged: function ()
 {
  var next = 0;
  while (next < this.level.beats && this.judged[next]) next++;
  return next;
 },
 revive: function ()
 {
  if (this.state !== 'result' || this.won || this.reviveUsed) return;
  this.reviveUsed = true; this.revivePending = true; this.lives = 1; this.combo = 0;
  this.state = 'paused'; updateHud();
  document.getElementById('pause-message').textContent = 'Жизнь получена! После продолжения — четыре бита на подготовку.';
  showScreen('screen-pause');
 },
 finish: function (won)
 {
  this.won = won;
  this.state = 'result'; Music.context.suspend(); YandexSDK.gameplayStop();
  Progress.updateHighScore(this.score);
  if (!this.attemptCounted)
  {
   this.attemptCounted = true; Ads.results++;
   Progress.set('gamesPlayed', Progress.get('gamesPlayed') + 1);
  }
  Ads.refreshOffer();
  if (won)
  {
   if (!this.completionPaid)
   {
    this.completionPaid = true; Progress.addCoins(CONFIG.COINS_FOR_COMPLETION); this.earnedCoins += CONFIG.COINS_FOR_COMPLETION;
   }
   var completed = Progress.get('completed') || {}; completed[this.levelIndex] = Math.max(completed[this.levelIndex] || 0, this.score); Progress.set('completed', completed);
  }
  document.getElementById('result-label').textContent = won ? 'ТРЕК ПРОЙДЕН' : 'ЕЩЁ ОДИН ПРЫЖОК';
  document.getElementById('result-title').textContent = won ? 'Это твой ритм!' : 'Поймаем бит?';
  document.getElementById('final-score').textContent = this.score.toLocaleString('ru');
  document.getElementById('result-coins').textContent = 'Заработано: +' + this.earnedCoins + ' ◈';
  document.getElementById('result-stats').textContent = 'Идеально: ' + this.perfect + ' • Лучшее комбо: ' + this.maxCombo;
  document.getElementById('btn-next').hidden = !won || this.levelIndex === 11;
  showScreen('screen-gameover');
 }
};
