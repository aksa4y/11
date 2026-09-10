var Ads =
{
 busy: false,
 lastRequest: Date.now(),
 results: 0,
 available: function (rewarded)
 {
  var sdk = YandexSDK.ysdk;
  return !!(sdk && sdk.adv && typeof sdk.adv[rewarded ? 'showRewardedVideo' : 'showFullscreenAdv'] === 'function');
 },
 lock: function (locked)
 {
  this.busy = locked;
  document.querySelectorAll('button').forEach(function (button) { button.disabled = locked; });
  document.getElementById('ad-status').textContent = locked ? 'Загрузка рекламы…' : '';
 },
 // Этот метод вызывается только на экране результата, когда игра остановлена.
 show: function (rewarded, callback)
 {
  if (this.busy || Game.state !== 'result') return;
  if (!this.available(rewarded)) { callback(false, false); return; }
  var self = this, earned = false, closed = false, opened = false;
  this.lock(true); this.lastRequest = Date.now();
  Game.state = 'ad'; YandexSDK.gameplayStop();
  if (Music.context) Music.context.suspend();
  function finish(failed)
  {
   if (closed) return;
   closed = true;
   Game.state = 'result'; self.lock(false);
   // Награда выдаётся один раз, после закрытия, только если SDK подтвердил просмотр.
   callback(earned, opened, failed);
  }
  var callbacks =
  {
   onOpen: function ()
   {
    if (closed) return;
    opened = true;
    if (Music.context) Music.context.suspend();
   },
   onClose: function () { finish(false); },
   onError: function () { finish(true); }
  };
  if (rewarded) callbacks.onRewarded = function () { if (!closed) earned = true; };
  try
  {
   YandexSDK.ysdk.adv[rewarded ? 'showRewardedVideo' : 'showFullscreenAdv']({ callbacks: callbacks });
  }
  catch (error) { finish(true); }
 },
 between: function (action)
 {
  if (this.busy) return;
  var eligible = Game.state === 'result' && this.results >= 2 && Date.now() - this.lastRequest >= CONFIG.AD_MIN_INTERVAL_MS && this.available(false);
  if (!eligible) { action(); return; }
  this.show(false, function ()
  {
   // Явное нажатие после рекламы сохраняет запуск звука в мобильных браузерах.
   Game.state = 'ready'; Ads.nextAction = action; showScreen('screen-ready');
  });
 },
 reward: function ()
 {
  if (this.busy || Game.state !== 'result' || Game.won || Game.reviveUsed || Game.nextUnjudged() >= Game.level.beats) return;
  this.show(true, function (earned)
  {
   if (earned) Game.revive();
   else document.getElementById('ad-status').textContent = 'Просмотр не засчитан или реклама недоступна. Можно попробовать ещё раз или начать заново.';
  });
 }
};
