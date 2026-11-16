# SOUL — Промпты для генерации карточек

Все промпты в едином стиле. Использовать через ChatGPT (DALL·E 3),
Bing Image Creator, Leonardo.ai или Midjourney.

---

## Мастер-шаблон (отправлять первым)

Прикрепить `killer.webp` как референс. Отправить один раз в начале
чата, потом использовать промпты по одному.

```
Я создаю карточки для браузерной карточной игры в тёмном
кинематографичном стиле. Прикрепляю референс. Все будущие картинки
в этом чате должны следовать этому стилю:

- Тёмный кинематографичный полуреалистичный арт, обложка мрачного комикса
- Одна доминирующая световая точка (свет сбоку или сверху), глубокие
  тени, драматичный chiaroscuro
- Палитра: чёрный, глубокий тёмно-синий, окисленный фиолетовый.
  Один яркий акцентный цвет на карточку (красный, янтарный,
  холодно-белый, изумрудный)
- Лёгкое зерно плёнки, матовый финиш
- Тонкая декоративная фиолетовая рамка по краям, с потёртыми
  «состаренными» углами, как у игральной карты
- Вертикальная композиция

Все карточки персонажей — смотрят прямо на зрителя, крупный
портрет до пояса.
Все карточки событий — без видимых лиц, только силуэты или
фигуры в тени, широкий кадр.

Сначала сгенерируй одну тестовую карточку по промпту ниже.
Я посмотрю результат и подтвержу стиль.

Промпт:
Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a shrewd middle-aged man in a sharp dark tailored
suit with no tie, unbuttoned collar. Slicked-back dark hair with silver
streaks, sharp narrow eyes, faint scar across one cheek. He holds a matte
black metal object between his fingers like a lighter. Background: dim
back-alley at night, blurred neon signs and wet asphalt. Deep violet rim
light from the side, one warm amber accent. Confident predatory
half-smile. Eyes locked on viewer. Ornate purple border with worn edges
like an old playing card.
```

---

## Финальный промпт (когда стиль начнёт отходить)

Если DALL·E начнёт «плыть» после 5–7 картинки — отправить:

```
Стоп. Вернись к стилю первой картинки в этом чате. Та же палитра,
то же освещение, та же фиолетовая рамка. Перегенерируй последнюю
с этим стилем.
```

---

# ПЕРСОНАЖИ (осталось 6 из 10)

## courier — Курьер

**Файл:** `apps/client/public/cards/characters/courier.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of an androgynous young person in a black windbreaker
with reflective purple stripes. A motorcycle helmet held under one arm,
tinted visor lifted, calm neutral eyes. Waterproof messenger bag across
the chest. Background: rainy street at night, blurred car headlights,
puddle reflections, cool cyan and purple tones. Eyes on viewer. Ornate
purple border with worn edges like an old playing card.
```

---

## mechanic — Механик

**Файл:** `apps/client/public/cards/characters/mechanic.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a broad-shouldered man in a black tank top and
leather apron, muscular tattooed arms, shaved head, faint scars on
forearms. Welding goggles pushed up on his forehead. He holds a heavy
matte black wrench. Background: night garage, sparks from a metal grinder
in the background, warm orange glow with violet reflections on wet
concrete. Steady focused gaze at viewer. Ornate purple border with worn
edges like an old playing card.
```

---

## smuggler — Контрабандист

**Файл:** `apps/client/public/cards/characters/smuggler.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a rough man in his forties, thick beard, worn
captain's hat, heavy wool coat with fur collar, cold-weather gear, a
faint scar across one temple. He holds a folded shipping manifest in
one gloved hand. Background: foggy docks at night, container silhouettes,
single hanging lamp, moonlight on the water. Muted blue and amber palette.
Steady watchful gaze at viewer. Ornate purple border with worn edges
like an old playing card.
```

---

## fixer — Решала

**Файл:** `apps/client/public/cards/characters/fixer.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a calm older man in a long charcoal overcoat and
dark turtleneck. Bald head, neatly trimmed grey beard, thin round glasses
reflecting a small light. An old worn leather briefcase at his side.
Background: dim hotel lobby at night, maroon velvet curtain, single
brass lamp glowing. Palette: black, dark brown, oxidized purple accent.
Unreadable composed expression, eyes on viewer. Ornate purple border with
worn edges like an old playing card.
```

---

## medic — Медик

**Файл:** `apps/client/public/cards/characters/medic.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a young woman with short messy dark hair, wearing a
white medical coat over a black hoodie, sleeves rolled up revealing
tattooed forearms. Surgical mask pulled down to her chin. Exhausted but
determined expression. Background: dim basement clinic, cold fluorescent
tube light, steel table with small metal instruments. Cold cyan and violet
accents. Eyes on viewer. Ornate purple border with worn edges like an old
playing card.
```

---

## informant — Информатор

**Файл:** `apps/client/public/cards/characters/informant.webp`

```
Следующая карточка, тот же стиль. Промпт:

Vertical portrait card (4:5), dark cinematic painterly illustration.
Waist-up portrait of a nervous thin young man in a wrinkled beige trench
coat and round glasses, glancing slightly over his shoulder. He holds a
folded newspaper close to his chest, a cigarette butt in the other hand.
Background: empty underground parking lot, single flickering fluorescent
light, long purple shadows on concrete columns. Anxious alert expression,
eyes toward viewer. Ornate purple border with worn edges like an old
playing card.
```

---

# СОБЫТИЯ (осталось 11 из 12)

## resell-batch — Перепродажа партии

**Файл:** `apps/client/public/cards/events/resell-batch.webp`

```
Теперь события. Тот же стиль, что и раньше, но композиция шире и без
лиц — только силуэты. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of a small warehouse loading dock at night.
Two shadowy figures in long coats exchange a metal briefcase under a
single amber streetlight. Stacked wooden crates behind them, a dark van
parked nearby, wet asphalt reflecting the light. No faces visible.
Palette: deep navy blue, warm amber, faint purple rim light. Ornate
purple border with worn edges like an old playing card.
```

---

## night-shift — Ночная смена

**Файл:** `apps/client/public/cards/events/night-shift.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot inside an old industrial workshop at night.
A lone worker silhouette at a workbench lit by a single hanging bulb.
Distant sparks from a welding torch, heavy machinery in deep shadow. No
faces visible. Palette: black, cold blue, one warm yellow light source,
subtle purple. Ornate purple border with worn edges like an old playing
card.
```

---

## black-market-deal — Сделка на чёрном рынке

**Файл:** `apps/client/public/cards/events/black-market-deal.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of an underground market in a dim basement.
Stacked crates and hanging bulbs, shadowy figures around a wooden table
covered with cash and small boxes. One central figure reaching for a
stack of bills, all faces in shadow. Palette: black, deep crimson, purple
ambient light. Ornate purple border with worn edges like an old playing
card.
```

---

## warehouse-escape — Побег со склада

**Файл:** `apps/client/public/cards/events/warehouse-escape.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Dynamic wide shot of a figure in a black hoodie running
along a narrow gap between two industrial warehouse walls at night.
Searchlight beams cutting through fog from behind, knocked-over boxes in
their wake, motion blur on the edges. No face visible. Palette: cold blue
night, harsh white searchlight, purple haze. Ornate purple border with
worn edges like an old playing card.
```

---

## night-convoy — Ночной конвой

**Файл:** `apps/client/public/cards/events/night-convoy.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of three black SUVs driving in tight formation
through a wet empty highway at night. Headlights cutting through fog, rain
streaks illuminated by the beams. No visible drivers. Palette: deep black,
cold white, violet reflections on wet asphalt. Ornate purple border with
worn edges like an old playing card.
```

---

## police-raid — Облава

**Файл:** `apps/client/public/cards/events/police-raid.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of a rundown apartment building at night being
surrounded by police vehicles. Harsh blue and red flashing light on the
facade, silhouettes of officers moving in the shadows, one window still
lit on the third floor. No clear faces. Palette: cold blue, red accents,
deep black. Ornate purple border with worn edges like an old playing card.
```

---

## deal-gone-wrong — Сделка сорвалась

**Файл:** `apps/client/public/cards/events/deal-gone-wrong.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of an abandoned parking garage at night.
Scattered papers, a tipped-over metal briefcase on the floor, small dark
marks on a concrete pillar, an empty chair under a single hanging light
swaying slightly. No people visible. Palette: concrete grey, deep black,
faint violet neon leaking from outside. Ornate purple border with worn
edges like an old playing card.
```

---

## cargo-theft — Кража груза

**Файл:** `apps/client/public/cards/events/cargo-theft.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of a freight train car being pried open at
night. A metal bar wedged into the door, silhouettes of two figures
working fast, stacked containers in the background, fog rolling across
the rails. No visible faces. Palette: deep blue, cold white, warning red
reflections. Ornate purple border with worn edges like an old playing
card.
```

---

## street-race — Уличная гонка

**Файл:** `apps/client/public/cards/events/street-race.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of two tuned cars mid-drift through an
industrial district at night. Tire smoke illuminated by purple neon and
orange streetlights, wet asphalt, motion blur on wheels. No visible
drivers. Palette: black, neon purple, hot orange. Ornate purple border
with worn edges like an old playing card.
```

---

## safe-cracking — Вскрытие сейфа

**Файл:** `apps/client/public/cards/events/safe-cracking.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Close shot of a gloved hand on the dial of a heavy steel
safe in a dark office. A single flashlight beam cutting through the dark,
dust particles floating in the air, a stethoscope pressed against the safe
door. No face visible. Palette: deep black, cold white flashlight, faint
amber office glow. Ornate purple border with worn edges like an old
playing card.
```

---

## smuggling-tunnel — Тоннель контрабанды

**Файл:** `apps/client/public/cards/events/smuggling-tunnel.webp`

```
Следующее событие, тот же стиль. Промпт:

Vertical cinematic illustration (3:4), dark painterly style like a noir
comic book cover. Wide shot of a narrow concrete tunnel lit by single
bulbs hanging every few meters. Wooden crates stacked along the walls,
water dripping from the ceiling, damp reflections on the floor. No people.
Palette: wet concrete grey, warm bulb glow, deep black depth. Ornate
purple border with worn edges like an old playing card.
```

---

# ЧЕК-ЛИСТ

## Персонажи (10)

- [x] killer
- [x] market-shark
- [x] workaholic
- [x] sniper
- [ ] courier
- [ ] mechanic
- [ ] smuggler
- [ ] fixer
- [ ] medic
- [ ] informant

## События (12)

- [x] raid-on-warehouse
- [ ] resell-batch
- [ ] night-shift
- [ ] black-market-deal
- [ ] warehouse-escape
- [ ] cargo-theft
- [ ] police-raid
- [ ] street-race
- [ ] safe-cracking
- [ ] deal-gone-wrong
- [ ] smuggling-tunnel
- [ ] night-convoy

---

# ПАПКИ ДЛЯ ФАЙЛОВ

```
apps/client/public/cards/
├── characters/
│   ├── killer.webp         ✅
│   ├── market-shark.webp   ✅
│   ├── workaholic.webp     ✅
│   ├── sniper.webp         ✅
│   ├── courier.webp
│   ├── mechanic.webp
│   ├── smuggler.webp
│   ├── fixer.webp
│   ├── medic.webp
│   └── informant.webp
│
└── events/
    ├── raid-on-warehouse.webp   ✅
    ├── resell-batch.webp
    ├── night-shift.webp
    ├── black-market-deal.webp
    ├── warehouse-escape.webp
    ├── cargo-theft.webp
    ├── police-raid.webp
    ├── street-race.webp
    ├── safe-cracking.webp
    ├── deal-gone-wrong.webp
    ├── smuggling-tunnel.webp
    └── night-convoy.webp
```

**Имя файла = slug карточки.** Регистр важен: `market-shark.webp`,
а не `MarketShark.webp` или `РыночныйАкула.webp`.

---

# КОНВЕРТАЦИЯ PNG → WEBP

ChatGPT и Bing отдают PNG. Игра ждёт WebP. Конвертировать
через ImageMagick:

**Установка (один раз):**
https://imagemagick.org/script/download.php#windows

**Конвертация всех PNG в папке:**

```powershell
cd путь\к\папке\с\png
magick mogrify -format webp -quality 82 *.png
```

Все `.png` превратятся в `.webp` рядом, оригиналы останутся.

**Альтернатива — онлайн:**

- https://squoosh.app (по одной)
- https://cloudconvert.com/png-to-webp (пакетно)

---

# ПОСЛЕ ГЕНЕРАЦИИ

1. Конвертировать все PNG в `.webp`.
2. Переименовать по slug'ам.
3. Разложить в `public/cards/characters/` и `public/cards/events/`.
4. Открыть игру → **F5**.
5. Картинки подхватятся автоматически. Никаких правок в коде
   или БД не требуется.

Если какая-то картинка не подхватилась — проверить:

- имя файла совпадает со slug в БД (в Prisma Studio);
- расширение `.webp` (не `.png`, не `.WEBP`);
- файл лежит именно в `public/cards/`, а не в `public/cards/cards/`.
