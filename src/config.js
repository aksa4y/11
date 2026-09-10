var CONFIG =
{
 GAME_ID: 'pulse_rhythm_v1', SOUND_ENABLED: true,
 AD_MIN_INTERVAL_MS: 90000,
 PERFECT_POINTS: 100, GOOD_POINTS: 60, MAX_MULTIPLIER: 8,
 LEVELS: [],
 WORLDS: ['Изумрудный рассвет', 'Лунный прилив', 'Аметистовый сон', 'Золотой горизонт'],
 HUES: [155, 192, 270, 38]
};
for (var i = 0; i < 12; i++)
 CONFIG.LEVELS.push({ name: ['Первый свет', 'Шёпот листвы', 'Зелёный пульс', 'Тихая вода', 'Глубина', 'Лунная волна', 'Сумерки', 'Кристаллы', 'Ночной полёт', 'Искры', 'Солнечный ветер', 'Сверхновая'][i], bpm: 88 + i * 6, beats: 128 + Math.floor(i / 3) * 16, world: Math.floor(i / 3) });
