var Music =
{
 context: null, master: null, nextStep: 0, origin: 0, muted: false,
 init: function ()
 {
  if (!this.context)
  {
   this.context = new (window.AudioContext || window.webkitAudioContext)();
   this.master = this.context.createGain();
   this.master.gain.value = this.muted ? 0 : 0.55;
   this.master.connect(this.context.destination);
  }
  return this.context.resume();
 },
 reset: function ()
 {
  var closing = this.context ? this.context.close() : Promise.resolve();
  return closing.then(function () { Music.context = null; return Music.init(); });
 },
 tone: function (frequency, time, length, type, volume)
 {
  var oscillator = this.context.createOscillator();
  var gain = this.context.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
  oscillator.connect(gain); gain.connect(this.master);
  oscillator.start(time); oscillator.stop(time + length + 0.02);
  oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
 },
 tick: function ()
 {
  if (Game.state !== 'playing') return;
  var half = Game.interval / 2;
  while (this.origin + this.nextStep * half < this.context.currentTime + 0.12)
  {
   var step = this.nextStep++, time = this.origin + step * half;
   if (time < this.context.currentTime) continue;
   var beat = Math.floor(step / 2), level = Game.level;
   if (beat > level.beats + 5) break;
   if (step % 2 === 0)
   {
    var kick = this.context.createOscillator(), gain = this.context.createGain();
    kick.frequency.setValueAtTime(135, time); kick.frequency.exponentialRampToValueAtTime(42, time + .12);
    gain.gain.setValueAtTime(.8, time); gain.gain.exponentialRampToValueAtTime(.001, time + .2);
    kick.connect(gain); gain.connect(this.master); kick.start(time); kick.stop(time + .22);
    kick.onended = (function (o, g) { return function () { o.disconnect(); g.disconnect(); }; })(kick, gain);
   }
   this.tone(7500, time, .035, 'square', .018);
   if (beat < 4) continue;
   var chords = [[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]];
   var chord = chords[(Math.floor((beat - 4) / 8) + level.world) % 4];
   var melody = chord[(step + Math.floor(step / 8) + Game.levelIndex) % 4] + 12;
   this.tone(440 * Math.pow(2, (melody - 69) / 12), time, half * 1.7, 'triangle', .2);
   if (step % 4 === 0) this.tone(440 * Math.pow(2, (chord[0] - 12 - 69) / 12), time, half * 3.5, 'sine', .35);
   if (step % 16 === 0)
    for (var n = 0; n < chord.length; n++) this.tone(440 * Math.pow(2, (chord[n] - 69) / 12), time, half * 13, 'sine', .045);
  }
 },
 mute: function ()
 {
  this.muted = !this.muted;
  if (this.master) this.master.gain.value = this.muted ? 0 : .55;
  Progress.set('muted', this.muted);
 }
};
