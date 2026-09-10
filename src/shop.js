var Shop =
{
 tab: 'skins', previewId: null,
 catalog: function () { return this.tab === 'skins' ? CONFIG.SKINS : CONFIG.BACKGROUNDS; },
 init: function ()
 {
  var data = Progress.get('cosmetics') || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  ['skins', 'backgrounds'].forEach(function (key)
  {
   var catalog = key === 'skins' ? CONFIG.SKINS : CONFIG.BACKGROUNDS;
   var owned = Array.isArray(data[key]) ? data[key] : [];
   data[key] = catalog.filter(function (item) { return item.price === 0 || owned.includes(item.id); }).map(function (item) { return item.id; });
   var selected = key === 'skins' ? 'skin' : 'background';
   if (!data[key].includes(data[selected])) data[selected] = catalog[0].id;
  });
  Progress._data.cosmetics = data;
  if (!Number.isFinite(Progress.get('coins')) || Progress.get('coins') < 0) Progress._data.coins = 0;
  Progress.save();
 },
 item: function (type, id)
 {
  var catalog = type === 'skins' ? CONFIG.SKINS : CONFIG.BACKGROUNDS;
  return catalog.find(function (item) { return item.id === id; }) || catalog[0];
 },
 skin: function () { return this.item('skins', Progress.get('cosmetics').skin); },
 background: function () { return this.item('backgrounds', Progress.get('cosmetics').background); },
 open: function ()
 {
  if (Game.state !== 'menu' || starting || Ads.busy) return;
  Game.state = 'shop'; this.selectTab('skins'); showScreen('screen-shop');
  document.getElementById('btn-shop-close').focus();
 },
 close: function ()
 {
  if (Game.state !== 'shop') return;
  toMenu(); document.getElementById('btn-shop').focus();
 },
 selectTab: function (tab)
 {
  this.tab = tab;
  this.previewId = Progress.get('cosmetics')[tab === 'skins' ? 'skin' : 'background'];
  this.refresh();
 },
 refresh: function ()
 {
  var data = Progress.get('cosmetics'), self = this;
  document.getElementById('shop-coins').textContent = Progress.get('coins').toLocaleString('ru') + ' ◈';
  document.getElementById('shop-skins').setAttribute('aria-pressed', this.tab === 'skins');
  document.getElementById('shop-backgrounds').setAttribute('aria-pressed', this.tab === 'backgrounds');
  var grid = document.getElementById('shop-grid'); grid.replaceChildren();
  this.catalog().forEach(function (item)
  {
   var selected = data[self.tab === 'skins' ? 'skin' : 'background'] === item.id;
   var owned = data[self.tab].includes(item.id);
   var button = document.createElement('button'); button.className = 'shop-item';
   button.setAttribute('aria-pressed', self.previewId === item.id);
   button.setAttribute('aria-label', item.name + ', ' + (selected ? 'выбрано' : owned ? 'куплено' : item.price + ' монет'));
   var canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = 110;
   var skin = self.tab === 'skins' ? item : self.skin();
   var bg = self.tab === 'backgrounds' ? item : self.background();
   Render.preview(canvas, skin, bg);
   var name = document.createElement('strong'); name.textContent = item.name;
   var status = document.createElement('span'); status.textContent = selected ? '✓ Выбрано' : owned ? 'В коллекции' : item.price + ' ◈';
   button.append(canvas, name, status);
   button.addEventListener('click', function () { self.previewId = item.id; self.refresh(); });
   grid.appendChild(button);
  });
  var item = this.item(this.tab, this.previewId);
  var owned = data[this.tab].includes(item.id);
  var selected = data[this.tab === 'skins' ? 'skin' : 'background'] === item.id;
  Render.preview(document.getElementById('shop-preview'), this.tab === 'skins' ? item : this.skin(), this.tab === 'backgrounds' ? item : this.background());
  document.getElementById('shop-preview-name').textContent = item.name;
  document.getElementById('shop-description').textContent = item.description;
  var action = document.getElementById('btn-shop-action');
  action.textContent = selected ? 'ВЫБРАНО ✓' : owned ? 'ВЫБРАТЬ' : 'КУПИТЬ И ВЫБРАТЬ · ' + item.price + ' ◈';
  action.disabled = selected || (!owned && Progress.get('coins') < item.price);
  document.getElementById('shop-status').textContent = !owned && Progress.get('coins') < item.price ? 'Не хватает ' + (item.price - Progress.get('coins')) + ' монет. Заработай их прыжками в такт.' : '';
 },
 purchase: function ()
 {
  if (Game.state !== 'shop') return false;
  var item = this.item(this.tab, this.previewId), data = Progress.get('cosmetics');
  if (!data[this.tab].includes(item.id))
  {
   if (Progress.get('coins') < item.price) return false;
   // Баланс, покупка и выбор сохраняются одной записью.
   Progress._data.coins -= item.price; data[this.tab].push(item.id);
  }
  data[this.tab === 'skins' ? 'skin' : 'background'] = item.id;
  Progress.save(); this.refresh(); updateMenu(); return true;
 }
};
