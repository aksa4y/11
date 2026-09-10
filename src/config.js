var CONFIG =
{
 GAME_ID: 'pulse_rhythm_v1', SOUND_ENABLED: true,
 AD_MIN_INTERVAL_MS: 90000,
 COINS_PER_HIT: 1, COINS_PER_PERFECT: 2, COINS_FOR_COMPLETION: 25,
 PERFECT_POINTS: 100, GOOD_POINTS: 60, MAX_MULTIPLIER: 8,
 LEVELS: [],
 WORLDS: ['Изумрудный рассвет', 'Лунный прилив', 'Аметистовый сон', 'Золотой горизонт'],
 HUES: [155, 192, 270, 38]
};
for (var i = 0; i < 12; i++)
 CONFIG.LEVELS.push({ name: ['Первый свет', 'Шёпот листвы', 'Зелёный пульс', 'Тихая вода', 'Глубина', 'Лунная волна', 'Сумерки', 'Кристаллы', 'Ночной полёт', 'Искры', 'Солнечный ветер', 'Сверхновая'][i], bpm: 88 + i * 6, beats: 128 + Math.floor(i / 3) * 16, world: Math.floor(i / 3) });

CONFIG.SKINS = [
 { id: 'pearl', name: 'Жемчуг', price: 0, hue: 155, pattern: 'ring', description: 'Мягкое свечение и тонкое орбитальное кольцо.' },
 { id: 'rose', name: 'Розовый кварц', price: 0, hue: 325, pattern: 'bands', description: 'Розовое стекло с двойной светящейся полосой.' },
 { id: 'sun', name: 'Солнечный', price: 80, hue: 38, pattern: 'rays', description: 'Золотое ядро с солнечными лучами.' },
 { id: 'ice', name: 'Ледяной', price: 120, hue: 195, pattern: 'facets', description: 'Холодный голубой кристалл с чёткими гранями.' },
 { id: 'orbit', name: 'Орбита', price: 180, hue: 267, pattern: 'orbit', description: 'Фиолетовый шар с двумя пересекающимися орбитами.' },
 { id: 'lava', name: 'Лава', price: 240, hue: 12, pattern: 'cracks', description: 'Тёмное ядро с огненными трещинами.' }
];
CONFIG.BACKGROUNDS = [
 { id: 'auto', name: 'По уровню', price: 0, hue: null, pattern: 'rings', description: 'Цвет мира автоматически меняется вместе с уровнем.' },
 { id: 'emerald', name: 'Изумруд', price: 0, hue: 155, pattern: 'rings', description: 'Изумрудный портал и светящиеся кристаллы.' },
 { id: 'ocean', name: 'Океан', price: 100, hue: 195, pattern: 'waves', description: 'Голубые волны света на тёмном горизонте.' },
 { id: 'neon', name: 'Неоновая ночь', price: 180, hue: 280, pattern: 'grid', description: 'Фиолетовый мир с перспективной неоновой сеткой.' },
 { id: 'sunset', name: 'Закат', price: 240, hue: 25, pattern: 'sun', description: 'Янтарный горизонт и полосатое светило.' }
];
