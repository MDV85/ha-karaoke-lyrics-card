/*
 * ha-karaoke-lyrics-card v2.0.4
 * Караоке с побуквенной подсветкой для Home Assistant.
 * Текст: LRCLib (lrclib.net). Синхронизация по позиции любого media_player.
 * По словам (enhanced LRC), если есть; иначе плавная закраска по строкам.
 */
const KLC_VERSION = '2.0.4';
const KLC_CACHE_DAYS = 30;
const KLC_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJnIiBjeD0iMjUlIiBjeT0iMjglIiByPSI5NSUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmOTgwMCIvPjxzdG9wIG9mZnNldD0iLjQyIiBzdG9wLWNvbG9yPSIjYzIxODViIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTU2NWMwIi8+PC9yYWRpYWxHcmFkaWVudD48ZmlsdGVyIGlkPSJzaCIgeD0iLTMwJSIgeT0iLTMwJSIgd2lkdGg9IjE2MCUiIGhlaWdodD0iMTYwJSI+PGZlRHJvcFNoYWRvdyBkeD0iMCIgZHk9IjEuNSIgc3RkRGV2aWF0aW9uPSIxLjYiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIuNDUiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9InVybCgjZykiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4IDYpIHNjYWxlKDEuNzUpIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuNDIiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDE4VjVsMTItMnYxMyIvPjxjaXJjbGUgY3g9IjYiIGN5PSIxOCIgcj0iMyIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuNDIiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjE2IiByPSIzIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii40MiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNyAxNykgc2NhbGUoMS42MikiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI3NoKSI+PHBhdGggZD0iTTE1IDEyLjlhNSA1IDAgMSAwIC0zLjkwMiAtMy45IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LC4xOCkiLz48cGF0aCBkPSJNMTUgMTIuOWwtMy45MDIgLTMuODk5bC03LjUxMyA4LjU4NGEyIDIgMCAxIDAgMi44MjcgMi44M2w4LjU4OCAtNy41MTV6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPgo=';
const KLC_RTL = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const klcColor = (v, fb) => {
  if (Array.isArray(v) && v.length >= 3) return `rgb(${v[0]}, ${v[1]}, ${v[2]})`;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return fb;
};
const klcList = (v) => (Array.isArray(v) ? v : (typeof v === 'string' && v ? [v] : [])).filter(Boolean);

const KLC_DEFAULTS = {
  players_mode: 'list',
  exclude_players: [],
  lyrics_provider: 'lrclib',
  title: '',
  font_weight: 700,
  font_family: '',
  line_spacing: 2.75,
  direction: 'auto',
  fog_strength: 24,
  background_blur: 28,
  background_brightness: 38,
  gap_threshold: 4,
  show_countdown: true,
  decor_count: 5,
  decor_opacity: 22,
  show_progress: true,
  show_mode: true,
  layout: 'fog',
  font_size: 19,
  alignment: 'center',
  fill_color: '#34c759',
  text_color: '#d9d9d9',
  countdown_color: '#ff3b30',
  countdown_lead: 2,
  offset: 0,
  offset_mode: 'song',
  show_header: true,
  show_offset: true,
  show_background: true,
  show_decor: true,
  show_visualizer: true,
  visualizer_width: 220,
  visualizer_source: 'animation',
  show_year: true,
};

/* ---------- переводы: ru / uk / en (язык из профиля Home Assistant) ---------- */
const KLC_I18N = {
  ru: {
    title: 'Караоке', sec: 'с',
    err_config: 'Нет настроек',
    err_players: 'Укажите хотя бы один плеер в players или включите players_mode: auto',
    reset: 'Сбросить', offset: 'сдвиг',
    nothing: 'Сейчас ничего не играет', searching: 'Ищу текст…',
    net_error: 'Не удалось связаться с lrclib.net: ', not_found: 'Текст для этой песни не найден',
    no_sync: 'Без синхронизации', sync_words: 'Синхронизация по словам', sync_lines: 'Синхронизация по строкам',
    no_position: 'плеер не передаёт позицию',
    description: 'Караоке с побуквенной закраской, туманом, отсчётом и визуализацией для любого media_player',
    S: { sources: 'Источники и плееры', view: 'Вид и текст', colors: 'Цвета', fog: 'Туман и фон', breaks: 'Проигрыши и отсчёт', decor: 'Оформление', panel: 'Шапка, панель и синхронизация' },
    L: {
      players_mode: 'Режим выбора плеера', players: 'Плееры (по порядку приоритета)', exclude_players: 'Исключить плееры',
      lyrics_provider: 'Источник текста', show_year: 'Год песни и альбома (MusicBrainz)', layout: 'Вид',
      font_size: 'Размер шрифта', font_weight: 'Жирность', font_family: 'Шрифт (пусто - как в теме)',
      line_spacing: 'Межстрочный интервал', alignment: 'Выравнивание', direction: 'Направление текста',
      height: 'Высота области текста (пусто - авто)', fill_color: 'Цвет закраски', text_color: 'Цвет текста',
      countdown_color: 'Цвет отсчёта', fog_strength: 'Плотность тумана', show_background: 'Обложка фоном',
      background_blur: 'Размытие фона', background_brightness: 'Яркость фона', gap_threshold: 'Проигрыш, если пауза дольше',
      show_countdown: 'Отсчёт 3-2-1-0 (киноплёнка)', countdown_lead: 'Пауза после «0» до строки',
      show_decor: 'Плавающие ноты по бокам', decor_count: 'Нот с каждой стороны', decor_opacity: 'Прозрачность нот',
      show_visualizer: 'Зеркальная волна', visualizer_source: 'Источник волны', visualizer_width: 'Ширина волны',
      show_header: 'Обложка и название', show_progress: 'Полоса прогресса и время', show_mode: 'Подпись «Синхронизация по…»',
      show_offset: 'Кнопки сдвига на карточке', offset_mode: 'Кнопки сдвига запоминают', offset: 'Сдвиг синхронизации',
      title: 'Заголовок, когда ничего не играет (пусто - «Караоке»)',
    },
    H: {
      players_mode: '«Все плееры автоматически» - карточка сама найдёт любой играющий media_player; список ниже тогда задаёт приоритет.',
      offset: 'Общий сдвиг для всех песен. Плюс - текст раньше, минус - позже. Шаг 0,01 секунды.',
      offset_mode: '«Для каждой песни отдельно» - сдвиг кнопками сохраняется для каждой песни. «Один на все песни» - общий сдвиг. Сохраняется в этом браузере.',
      gap_threshold: 'Пауза без текста дольше этого считается проигрышем: ноты и отсчёт.',
      direction: '«Авто» - иврит и арабский сами закрашиваются справа налево.',
      visualizer_source: '«Микрофон этого устройства» - настоящая волна по звуку в комнате (музыка и голос). Нужен https и разрешение на микрофон. Звук никуда не отправляется.',
    },
    O: {
      list: 'Только из списка', auto: 'Все плееры автоматически', lrclib: 'LRCLib (бесплатно, без ключей)',
      fog: 'Туман - 5 строк', two_line: 'Две строки', compact: 'Одна строка',
      w400: 'Обычный', w500: 'Средний', w700: 'Жирный', w800: 'Очень жирный',
      left: 'Слева', center: 'По центру', right: 'Справа', dir_auto: 'Авто', ltr: 'Слева направо', rtl: 'Справа налево',
      animation: 'Анимация', mic: 'Микрофон этого устройства', song: 'Для каждой песни отдельно', global: 'Один на все песни',
    },
  },
  uk: {
    title: 'Караоке', sec: 'с',
    err_config: 'Немає налаштувань',
    err_players: 'Вкажіть хоча б один плеєр у players або увімкніть players_mode: auto',
    reset: 'Скинути', offset: 'зсув',
    nothing: 'Зараз нічого не грає', searching: 'Шукаю текст…',
    net_error: 'Не вдалося зв’язатися з lrclib.net: ', not_found: 'Текст для цієї пісні не знайдено',
    no_sync: 'Без синхронізації', sync_words: 'Синхронізація за словами', sync_lines: 'Синхронізація за рядками',
    no_position: 'плеєр не передає позицію',
    description: 'Караоке з політерним зафарбовуванням, туманом, відліком і візуалізацією для будь-якого media_player',
    S: { sources: 'Джерела і плеєри', view: 'Вигляд і текст', colors: 'Кольори', fog: 'Туман і фон', breaks: 'Програші й відлік', decor: 'Оформлення', panel: 'Шапка, панель і синхронізація' },
    L: {
      players_mode: 'Режим вибору плеєра', players: 'Плеєри (за порядком пріоритету)', exclude_players: 'Виключити плеєри',
      lyrics_provider: 'Джерело тексту', show_year: 'Рік пісні та альбому (MusicBrainz)', layout: 'Вигляд',
      font_size: 'Розмір шрифту', font_weight: 'Товщина', font_family: 'Шрифт (порожньо - як у темі)',
      line_spacing: 'Міжрядковий інтервал', alignment: 'Вирівнювання', direction: 'Напрямок тексту',
      height: 'Висота області тексту (порожньо - авто)', fill_color: 'Колір зафарбовування', text_color: 'Колір тексту',
      countdown_color: 'Колір відліку', fog_strength: 'Щільність туману', show_background: 'Обкладинка фоном',
      background_blur: 'Розмиття фону', background_brightness: 'Яскравість фону', gap_threshold: 'Програш, якщо пауза довша',
      show_countdown: 'Відлік 3-2-1-0 (кіноплівка)', countdown_lead: 'Пауза після «0» до рядка',
      show_decor: 'Плаваючі ноти з боків', decor_count: 'Нот з кожного боку', decor_opacity: 'Прозорість нот',
      show_visualizer: 'Дзеркальна хвиля', visualizer_source: 'Джерело хвилі', visualizer_width: 'Ширина хвилі',
      show_header: 'Обкладинка і назва', show_progress: 'Смуга прогресу і час', show_mode: 'Підпис «Синхронізація за…»',
      show_offset: 'Кнопки зсуву на картці', offset_mode: 'Кнопки зсуву запам’ятовують', offset: 'Зсув синхронізації',
      title: 'Заголовок, коли нічого не грає (порожньо - «Караоке»)',
    },
    H: {
      players_mode: '«Усі плеєри автоматично» - картка сама знайде будь-який media_player, що грає; список нижче тоді задає пріоритет.',
      offset: 'Загальний зсув для всіх пісень. Плюс - текст раніше, мінус - пізніше. Крок 0,01 секунди.',
      offset_mode: '«Для кожної пісні окремо» - зсув кнопками зберігається для кожної пісні. «Один на всі пісні» - загальний зсув. Зберігається в цьому браузері.',
      gap_threshold: 'Пауза без тексту, довша за цю, вважається програшем: ноти і відлік.',
      direction: '«Авто» - іврит і арабська самі зафарбовуються справа наліво.',
      visualizer_source: '«Мікрофон цього пристрою» - справжня хвиля за звуком у кімнаті (музика і голос). Потрібен https і дозвіл на мікрофон. Звук нікуди не надсилається.',
    },
    O: {
      list: 'Лише зі списку', auto: 'Усі плеєри автоматично', lrclib: 'LRCLib (безкоштовно, без ключів)',
      fog: 'Туман - 5 рядків', two_line: 'Два рядки', compact: 'Один рядок',
      w400: 'Звичайний', w500: 'Середній', w700: 'Жирний', w800: 'Дуже жирний',
      left: 'Ліворуч', center: 'По центру', right: 'Праворуч', dir_auto: 'Авто', ltr: 'Зліва направо', rtl: 'Справа наліво',
      animation: 'Анімація', mic: 'Мікрофон цього пристрою', song: 'Для кожної пісні окремо', global: 'Один на всі пісні',
    },
  },
  en: {
    title: 'Karaoke', sec: 's',
    err_config: 'No configuration',
    err_players: 'Add at least one player to players or set players_mode: auto',
    reset: 'Reset', offset: 'offset',
    nothing: 'Nothing is playing', searching: 'Looking for lyrics…',
    net_error: 'Could not reach lrclib.net: ', not_found: 'No lyrics found for this song',
    no_sync: 'Not synced', sync_words: 'Synced by word', sync_lines: 'Synced by line',
    no_position: 'player does not report position',
    description: 'Karaoke with letter-by-letter fill, fog, countdown and visualizer for any media_player',
    S: { sources: 'Sources and players', view: 'Layout and text', colors: 'Colors', fog: 'Fog and background', breaks: 'Breaks and countdown', decor: 'Styling', panel: 'Header, panel and sync' },
    L: {
      players_mode: 'Player selection mode', players: 'Players (in priority order)', exclude_players: 'Exclude players',
      lyrics_provider: 'Lyrics source', show_year: 'Song and album year (MusicBrainz)', layout: 'Layout',
      font_size: 'Font size', font_weight: 'Font weight', font_family: 'Font (empty - theme font)',
      line_spacing: 'Line spacing', alignment: 'Alignment', direction: 'Text direction',
      height: 'Lyrics area height (empty - auto)', fill_color: 'Fill color', text_color: 'Text color',
      countdown_color: 'Countdown color', fog_strength: 'Fog density', show_background: 'Album art background',
      background_blur: 'Background blur', background_brightness: 'Background brightness', gap_threshold: 'Break if the pause is longer than',
      show_countdown: '3-2-1-0 countdown (film leader)', countdown_lead: 'Pause after "0" before the line',
      show_decor: 'Floating notes on the sides', decor_count: 'Notes per side', decor_opacity: 'Note opacity',
      show_visualizer: 'Mirror wave', visualizer_source: 'Wave source', visualizer_width: 'Wave width',
      show_header: 'Album art and title', show_progress: 'Progress bar and time', show_mode: '"Synced by…" label',
      show_offset: 'Offset buttons on the card', offset_mode: 'Offset buttons remember', offset: 'Sync offset',
      title: 'Title when nothing is playing (empty - "Karaoke")',
    },
    H: {
      players_mode: '"All players automatically" - the card finds any playing media_player; the list below then sets the priority.',
      offset: 'Common offset for all songs. Plus - lyrics earlier, minus - later. Step 0.01 seconds.',
      offset_mode: '"Per song" - the button offset is saved for each song. "One for all songs" - a common offset. Saved in this browser.',
      gap_threshold: 'A pause without lyrics longer than this counts as a break: notes and countdown.',
      direction: '"Auto" - Hebrew and Arabic fill right to left automatically.',
      visualizer_source: '"This device\'s microphone" - a real wave from the sound in the room (music and voice). Requires https and microphone permission. Audio is never sent anywhere.',
    },
    O: {
      list: 'Only listed players', auto: 'All players automatically', lrclib: 'LRCLib (free, no keys)',
      fog: 'Fog - 5 lines', two_line: 'Two lines', compact: 'One line',
      w400: 'Regular', w500: 'Medium', w700: 'Bold', w800: 'Extra bold',
      left: 'Left', center: 'Center', right: 'Right', dir_auto: 'Auto', ltr: 'Left to right', rtl: 'Right to left',
      animation: 'Animation', mic: 'This device\'s microphone', song: 'Per song', global: 'One for all songs',
    },
  },
};

const klcLang = (hass) => {
  const l = String((hass && ((hass.locale && hass.locale.language) || hass.language))
    || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || 'en').toLowerCase();
  if (l.startsWith('uk')) return 'uk';
  if (l.startsWith('ru')) return 'ru';
  return 'en';
};
const klcT = (lang) => KLC_I18N[lang] || KLC_I18N.en;

class KaraokeLyricsCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('karaoke-lyrics-card-editor');
  }

  static getStubConfig(hass) {
    const players = Object.keys((hass && hass.states) || {})
      .filter((e) => e.startsWith('media_player.'))
      .slice(0, 2);
    return { players_mode: 'auto', players, layout: 'fog' };
  }

  setConfig(config) {
    if (!config) throw new Error(klcT(this._lang || klcLang(this._hass)).err_config);
    const players = klcList(config.players);
    if ((config.players_mode || 'list') !== 'auto' && !players.length) {
      throw new Error(klcT(this._lang || klcLang(this._hass)).err_players);
    }
    this._config = Object.assign({}, KLC_DEFAULTS, config, { players, exclude_players: klcList(config.exclude_players) });
    this._fs = Number(this._config.font_size) || 19;
    this._gap = Math.round(this._fs * (Number(this._config.line_spacing) || 2.75));
    const autoH = { fog: 5.2, two_line: 2.6, compact: 1.7 }[this._config.layout] || 5.2;
    this._H = Number(this._config.height) || Math.round(this._gap * autoH);
    this._baseOffset = Number(this._config.offset) || 0;
    this._perSong = this._config.offset_mode !== 'global';
    this._adj = this._perSong ? 0 : this._readGlobalAdj();
    this._key = null;
    this._data = null;
    this._cur = -2;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._build();
    this._micSync();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    const lg = klcLang(hass);
    if (lg !== this._lang) {
      this._lang = lg;
      if (this._config && this.shadowRoot) { this._build(); this._key = null; this._cur = -2; }
    }
    this._update();
  }

  get _t() { return klcT(this._lang || klcLang(this._hass)); }

  getCardSize() {
    return Math.ceil((this._H || 270) / 50) + (this._config && this._config.show_header ? 2 : 0);
  }

  connectedCallback() {
    if (!this._raf) this._raf = requestAnimationFrame(() => this._frame());
    this._micSync();
  }

  disconnectedCallback() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this._micStop();
  }

  /* ---------- микрофон для волны ---------- */
  _micWanted() {
    return !!(this._config && this._config.show_visualizer && this._config.visualizer_source === 'mic' && this.isConnected);
  }

  _micSync() {
    if (this._micWanted()) this._micStart(); else this._micStop();
  }

  async _micStart() {
    if (this._mic) return;
    const md = navigator.mediaDevices;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!md || !md.getUserMedia || !AC || !window.isSecureContext) {
      this._mic = { failed: 'https' };
      return;
    }
    const m = this._mic = { pending: true };
    try {
      const stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (this._mic !== m || !this._micWanted()) { stream.getTracks().forEach((t) => t.stop()); return; }
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 2048; an.smoothingTimeConstant = 0.55; an.minDecibels = -85; an.maxDecibels = -20;
      src.connect(an);
      Object.assign(m, { pending: false, stream, ctx, an, buf: new Uint8Array(an.frequencyBinCount), bands: null });
      const resume = () => { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); };
      resume();
      m.onTap = resume;
      this.addEventListener('click', resume);
    } catch (e) {
      if (this._mic === m) this._mic = { failed: 'denied' };
    }
  }

  _micStop() {
    const m = this._mic;
    this._mic = null;
    if (!m) return;
    if (m.stream) m.stream.getTracks().forEach((t) => t.stop());
    if (m.ctx) m.ctx.close().catch(() => {});
    if (m.onTap) this.removeEventListener('click', m.onTap);
    if (this._el) this._el.card.classList.remove('micon');
  }

  _micLevels(N) {
    const m = this._mic;
    if (!m || !m.an || m.ctx.state !== 'running') return null;
    if (!m.bands || m.bands.N !== N) {
      const nyq = m.ctx.sampleRate / 2, bins = m.buf.length, c = (N - 1) / 2, f = (d) => 70 * Math.pow(9000 / 70, d);
      const step = 1 / Math.max(1, c);
      m.bands = { N, r: Array.from({ length: N }, (_, i) => {
        const d = c ? Math.abs(i - c) / c : 0;
        const lo = Math.max(1, Math.floor(f(Math.max(0, d - step / 2)) / nyq * bins));
        const hi = Math.max(lo + 1, Math.ceil(f(Math.min(1, d + step / 2)) / nyq * bins));
        return [lo, Math.min(bins, hi)];
      }) };
    }
    m.an.getByteFrequencyData(m.buf);
    return m.bands.r.map(([lo, hi]) => {
      let mx = 0;
      for (let k = lo; k < hi; k++) if (m.buf[k] > mx) mx = m.buf[k];
      return Math.pow(mx / 255, 1.25);
    });
  }

  /* ---------- разметка ---------- */
  _build() {
    const c = this._config;
    const g = this._gap;
    const align = ['left', 'right'].includes(c.alignment) ? c.alignment : 'center';
    const origin = align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center';
    const fogA = Math.max(0, Math.min(45, Number(c.fog_strength) >= 0 ? Number(c.fog_strength) : 24));
    const fw = Number(c.font_weight) || 700;
    this.shadowRoot.innerHTML = `
      <style>
        :host { --hi: ${klcColor(c.fill_color, '#34c759')}; --lo: ${klcColor(c.text_color, '#d9d9d9')}; --cd: ${klcColor(c.countdown_color, '#ff3b30')};
                --dop: ${Math.max(0.02, Math.min(1, (Number(c.decor_opacity) || 22) / 100))}; --fs: ${this._fs}px; --g: ${g}px; --ld: ${Math.max(90, Math.min(this._H - 16, 220))}px; --h: ${this._H}px; }
        ha-card { padding: 16px; overflow: hidden; position: relative; container-type: inline-size; ${c.font_family ? `font-family: ${String(c.font_family).replace(/[;{}<>]/g, '')};` : ''} }
        .cbg { position: absolute; inset: -30px; z-index: 0; display: ${c.show_background ? 'block' : 'none'};
               background: radial-gradient(circle at 25% 30%, #ff9800 0, #c2185b 35%, #1565c0 70%, #0d1b3d 100%) center/cover no-repeat;
               filter: blur(${Number(c.background_blur) >= 0 ? Number(c.background_blur) : 28}px) brightness(${(Number(c.background_brightness) || 38) / 100}) saturate(1.3); transition: background-image .6s ease; }
        .body { position: relative; z-index: 1; transition: filter .4s ease, opacity .4s ease; }
        ha-card.cdon .body { filter: blur(4px); opacity: .25; }
        ha-card.withbg { color: #f2f2f2; }
        ha-card.withbg .cover { width: 64px; height: 64px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,.5); }
        ha-card.withbg .title { font-size: 17px; }
        ha-card.withbg .artist { font-size: 13px; opacity: .75; }
        ha-card.withbg .ln { text-shadow: 0 2px 8px rgba(0,0,0,.6); }
        ha-card.withbg .off button { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.25); }
        .top { display: ${c.show_header ? 'flex' : 'none'}; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 8px; }
        .info { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 0 1 ${(Number(c.visualizer_width) || 220) + 16}px; max-width: ${(Number(c.visualizer_width) || 220) + 16}px; }
        .cover { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0;
                 background: url("${KLC_LOGO}") center/cover no-repeat; }
        .meta { min-width: 0; flex: 1; }
        .title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; min-width: 0; }
        .title .tt { flex: 0 1 auto; }
        .mqw { overflow: hidden; white-space: nowrap; min-width: 0; }
        .mqw .mq { display: inline-block; will-change: transform, opacity; backface-visibility: hidden; }
        .mqw.run { -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 16px), transparent);
                   mask-image: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 16px), transparent); }
        .mqw.run { margin-left: -12px; }
        .mqw.run .mq { padding: 0 16px 0 12px; }
        .yr { display: inline-block; margin-left: 6px; vertical-align: 1px; line-height: 1.3; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 6px; letter-spacing: .5px;
              background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }
        .yr:empty { display: none; }
        .artist b { font-weight: 700; opacity: .9; }
        .artist { font-size: 12px; opacity: .65; white-space: nowrap; overflow: hidden; }
        .artist .ai { display: inline-block; max-width: 100%; vertical-align: top; will-change: transform, opacity, filter;
                      transition: transform 1.2s cubic-bezier(.65, 0, .35, 1), opacity 1.2s ease-in-out, filter 1.2s ease-in-out; }
        .artist .ai.up { transform: translateY(-70%); opacity: 0; filter: blur(3px); }
        .artist .ai.down { transform: translateY(70%); opacity: 0; filter: blur(3px); transition: none; }
        .artist.cut { -webkit-mask-image: linear-gradient(90deg, #000 78%, transparent); mask-image: linear-gradient(90deg, #000 78%, transparent); }
        .src { font-size: 10px; letter-spacing: 1px; opacity: .45; text-transform: uppercase; margin-top: 2px;
               white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .lyr { position: relative; height: ${this._H}px; overflow: hidden; }
        .lyr.fog .inner { -webkit-mask-image: linear-gradient(transparent 0%, #000 ${fogA}%, #000 ${100 - fogA}%, transparent 100%);
                          mask-image: linear-gradient(transparent 0%, #000 ${fogA}%, #000 ${100 - fogA}%, transparent 100%); }
        .lyr.plain { overflow-y: auto; -webkit-mask-image: none; mask-image: none; }
        .inner { position: absolute; top: 0; bottom: 0; left: ${c.show_decor ? '12%' : '0'}; right: ${c.show_decor ? '12%' : '0'};
                 transition: filter .4s ease, opacity .4s ease; }
        .lyr.plain .inner { position: static; -webkit-mask-image: none; mask-image: none; }

        .ln { position: absolute; left: 0; right: 0; top: 50%; margin-top: calc(var(--fs) * -0.7);
              text-align: ${align}; transform-origin: ${origin};
              font-size: var(--fs); font-weight: ${fw}; line-height: 1.3; padding: 0 8px;
              opacity: 0; filter: blur(12px); transform: translateY(calc(var(--g) * 3)) scale(.88);
              transition: transform .8s cubic-bezier(.22,.8,.3,1), opacity .8s ease, filter .8s ease;
              will-change: transform, opacity, filter; }
        .ln.up { transform: translateY(calc(var(--g) * -3)) scale(.88); }

        .fog .ln.dm1 { opacity: .35; filter: blur(5px); transform: translateY(calc(var(--g) * -2)) scale(.9); }
        .fog .ln.d0  { opacity: 1;   filter: none;      transform: translateY(calc(var(--g) * -1)) scale(1.08); }
        .fog .ln.d1  { opacity: .9;  filter: none;      transform: translateY(0) scale(.96); }
        .fog .ln.d2  { opacity: .75; filter: none;      transform: translateY(var(--g)) scale(.94); }
        .fog .ln.d3  { opacity: .35; filter: blur(5px); transform: translateY(calc(var(--g) * 2)) scale(.9); }

        .two_line .ln.d0 { opacity: 1;  filter: none; transform: translateY(calc(var(--g) * -0.5)) scale(1.05); }
        .two_line .ln.d1 { opacity: .8; filter: none; transform: translateY(calc(var(--g) * 0.5)) scale(.95); }

        .compact .ln.d0 { opacity: 1; filter: none; transform: translateY(0) scale(1); }

        .lyr.plain .ln { position: static; margin: 0; opacity: .8; filter: none; transform: none;
                         font-size: calc(var(--fs) * .85); font-weight: 400; padding: 5px 8px; }

        .w { position: relative; display: inline-block; margin: 0 .16em; color: var(--lo); white-space: nowrap; }
        .f { position: absolute; left: 0; top: 0; height: 100%; width: 0; overflow: hidden;
             color: var(--hi); white-space: nowrap; pointer-events: none; }
        .lyr.plain .f { display: none; }
        .ln[dir=rtl] .f { left: auto; right: 0; direction: rtl; }

        .ln.gap { line-height: 1; white-space: nowrap; }
        .nt { position: relative; display: inline-block; margin: 0 .16em; color: var(--lo); white-space: nowrap; }
        .n1 { font-size: 1.55em; } .n2 { font-size: 1.2em; } .n3 { font-size: .9em; }
        .leader { position: absolute; left: 50%; top: 50%; width: var(--ld); height: var(--ld);
                  margin: calc(var(--ld) / -2) 0 0 calc(var(--ld) / -2);
                  display: none; pointer-events: none; perspective: 600px; z-index: 3; }
        ha-card.cdon .leader { display: block; animation: klcflick .12s steps(2) infinite; }
        @keyframes klcflick { 0% { opacity: 1; } 50% { opacity: .9; } }
        .sweep { position: absolute; inset: 6.5%; border-radius: 50%; }
        .leader svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .dg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
              font-size: calc(var(--ld) * .55); font-weight: 800; line-height: 1; color: var(--cd);
              text-shadow: 0 0 12px var(--cd), 0 0 30px var(--cd); font-variant-numeric: tabular-nums; }
        .e3 { animation: klc3 .6s cubic-bezier(.2,.9,.3,1); }
        @keyframes klc3 { 0% { transform: scale(3.2); opacity: 0; filter: blur(10px); } 100% { transform: scale(1); opacity: 1; filter: blur(0); } }
        .e2 { animation: klc2 .6s cubic-bezier(.2,.9,.3,1); }
        @keyframes klc2 { 0% { transform: rotateX(95deg); opacity: 0; } 60% { transform: rotateX(-18deg); opacity: 1; } 100% { transform: rotateX(0); } }
        .e1 { animation: klc1 .7s cubic-bezier(.2,.9,.3,1); }
        @keyframes klc1 { 0% { transform: translateY(40%) scale(.6); opacity: 0; } 45% { transform: translateY(-5%) scale(1.1); opacity: 1; }
                          60% { transform: translateX(-3%); } 70% { transform: translateX(3%); } 80% { transform: translateX(-1.5%); } 100% { transform: none; } }
        .e0 { animation: klc0 .9s ease-out forwards; font-weight: 700; text-shadow: 0 0 1px rgba(0,0,0,.55), 0 0 6px color-mix(in srgb, var(--cd) 70%, transparent); }
        @keyframes klc0 { 0% { transform: scale(2); opacity: 0; filter: blur(6px); }
                          22% { transform: scale(1); opacity: 1; filter: blur(0); }
                          75% { transform: scale(1.04); opacity: 1; filter: blur(0); }
                          100% { transform: scale(1.18); opacity: 0; filter: blur(0); } }
        .wave { position: absolute; inset: 6.5%; border-radius: 50%; border: 3px solid var(--cd); opacity: 0; }
        .wave.go { animation: klcwave .6s ease-out; }
        @keyframes klcwave { 0% { transform: scale(.6); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
        .deco { position: absolute; inset: 0; pointer-events: none; display: ${c.show_decor ? 'block' : 'none'}; }
        .fn { position: absolute; bottom: -30px; color: currentColor; opacity: 0;
              animation: klcfloat 10s linear infinite; animation-play-state: paused; }
        .fn.r { animation-name: klcfloatr; }
        @keyframes klcfloat {
          0%   { transform: translateY(0) rotate(-10deg); opacity: 0; }
          15%  { opacity: var(--dop); }
          50%  { transform: translateY(calc(var(--h) * -0.55)) translateX(8px) rotate(8deg); }
          85%  { opacity: calc(var(--dop) * .8); }
          100% { transform: translateY(calc(var(--h) * -1.15)) translateX(0) rotate(-6deg); opacity: 0; }
        }
        @keyframes klcfloatr {
          0%   { transform: translateY(0) rotate(10deg); opacity: 0; }
          15%  { opacity: var(--dop); }
          50%  { transform: translateY(calc(var(--h) * -0.55)) translateX(-8px) rotate(-8deg); }
          85%  { opacity: calc(var(--dop) * .8); }
          100% { transform: translateY(calc(var(--h) * -1.15)) translateX(0) rotate(6deg); opacity: 0; }
        }
        ha-card.playing .fn { animation-play-state: running; }
        .vu { width: ${Number(c.visualizer_width) || 220}px; flex: 0 3 ${Number(c.visualizer_width) || 220}px; min-width: 0; height: 64px;
              display: ${c.show_visualizer ? 'block' : 'none'}; opacity: 0; transition: opacity .6s ease; }
        ha-card.playing .vu, ha-card.micon .vu { opacity: 1; }
        .prg { display: ${c.show_progress ? 'flex' : 'none'}; align-items: center; gap: 10px; margin-top: 8px; }
        .pgb { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.15); overflow: hidden; }
        .pgf { height: 100%; width: 0; border-radius: 2px; background: var(--hi); }
        .tm { font-size: 11px; opacity: .8; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
               text-align: center; opacity: .7; font-size: 14px; padding: 0 20px; z-index: 2; }
        .bot { display: flex; align-items: center; justify-content: space-between; gap: 6px 8px; flex-wrap: wrap;
               margin-top: 6px; font-size: 12px; line-height: 1.2; }
        .mode { display: ${c.show_mode ? 'inline' : 'none'}; opacity: .6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; max-width: 100%; }
        .off { display: ${c.show_offset ? 'flex' : 'none'}; align-items: center; gap: 4px; margin-left: auto; flex-shrink: 0; }
        .off button { font: inherit; font-size: 12px; color: inherit; cursor: pointer; padding: 3px 8px; border-radius: 8px;
                      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); line-height: 1.2; }
        .off button:hover { background: rgba(255,255,255,.16); }
        .offv { min-width: 74px; text-align: center; cursor: pointer; opacity: .85; font-variant-numeric: tabular-nums; }
      </style>
      <ha-card class="${c.show_background ? 'withbg' : ''}" id="card">
        <div class="cbg" id="cbg"></div>
        <div class="body">
        <div class="top">
          <div class="info">
          <div class="cover" id="cover"></div>
          <div class="meta">
            <div class="title"><span class="tt mqw" id="title">—</span></div>
            <div class="artist" id="artist"></div>
            <div class="src" id="src"></div>
          </div>
          </div>
          <canvas class="vu" id="vu"></canvas>
        </div>
        <div class="lyr ${['fog', 'two_line', 'compact'].includes(c.layout) ? c.layout : 'fog'}" id="lyr">
          <div class="deco" id="deco"></div>
          <div class="inner" id="inner"></div><div class="msg" id="msg"></div>
        </div>
        <div class="prg"><div class="pgb"><div class="pgf" id="pgf"></div></div><span class="tm" id="tm"></span></div>
        <div class="bot">
          <span class="mode" id="mode"></span>
          <span class="off">
            <button id="m5">-0.5</button>
            <button id="m1">-0.1</button>
            <span class="offv" id="offv" title="${this._t.reset}"></span>
            <button id="p1">+0.1</button>
            <button id="p5">+0.5</button>
          </span>
        </div>
        </div>
        <div class="leader">
          <div class="sweep" id="sweep"></div>
          <svg viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="96" fill="none" stroke="var(--cd)" stroke-opacity=".85" stroke-width="3"/>
            <circle cx="110" cy="110" r="80" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
            <line x1="110" y1="6" x2="110" y2="214" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <line x1="6" y1="110" x2="214" y2="110" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <line id="hand" x1="110" y1="110" x2="110" y2="14" stroke="var(--cd)" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <div class="wave" id="wave"></div>
          <div class="dg" id="dg"></div>
        </div>
      </ha-card>`;
    const $ = (id) => this.shadowRoot.getElementById(id);
    this._artSig = null; this._artParts = null;
    this._el = {
      cover: $('cover'), title: $('title'), artist: $('artist'), src: $('src'),
      lyr: $('lyr'), inner: $('inner'), msg: $('msg'), mode: $('mode'), offv: $('offv'),
      dg: $('dg'), sweep: $('sweep'), hand: $('hand'), wave: $('wave'),
      card: $('card'), cbg: $('cbg'), vu: $('vu'), pgf: $('pgf'), tm: $('tm'),
    };
    const sym = ['♪', '♫', '♬', '♩', '♪', '♫', '♬', '♩'];
    const xs = [3, 7.5, 4.5, 8.5, 5.5, 2, 6.5, 9];
    const sz = [18, 24, 16, 22, 20, 15, 21, 17];
    const DUR = 10, N = Math.max(0, Math.min(8, Math.round(Number(c.decor_count) >= 0 ? Number(c.decor_count) : 5)));
    const STEP = N ? DUR / N : DUR;
    let dh = '';
    for (let k = 0; k < N; k++) {
      dh += `<span class="fn" style="left:${xs[k]}%;font-size:${sz[k]}px;animation-delay:-${(k * STEP).toFixed(2)}s">${sym[k]}</span>`;
      dh += `<span class="fn r" style="right:${xs[k]}%;font-size:${sz[k]}px;animation-delay:-${(k * STEP + STEP / 2).toFixed(2)}s">${sym[k]}</span>`;
    }
    $('deco').innerHTML = dh;
    this._setupVu();
    if (this._ro) this._ro.disconnect();
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(() => {
        const w = Math.round(this._el.vu.getBoundingClientRect().width);
        if (w && (!this._vu || w !== this._vu.W)) this._setupVu();
        const tw = Math.round(this._el.title.parentElement.getBoundingClientRect().width);
        if (tw !== this._mqW) { this._mqW = tw; this._mqFit(this._el.title); }
      });
      this._ro.observe(this._el.vu);
      this._ro.observe(this._el.card);
    }
    this._vuNext = 0;

    $('m5').addEventListener('click', () => this._shift(-0.5));
    $('m1').addEventListener('click', () => this._shift(-0.1));
    $('p1').addEventListener('click', () => this._shift(0.1));
    $('p5').addEventListener('click', () => this._shift(0.5));
    $('offv').addEventListener('click', () => { this._adj = 0; this._saveAdj(); this._showOffset(); });
    this._showOffset();
    this._cur = -2;
    if (this._data) this._apply(this._data);
  }

  _shift(d) {
    this._adj = Math.round((this._adj + d) * 100) / 100;
    this._saveAdj();
    this._showOffset();
  }

  _readGlobalAdj() {
    try { return Number(localStorage.getItem('klc_adj')) || 0; } catch (e) { return 0; }
  }

  _songAdjMap() {
    try { return JSON.parse(localStorage.getItem('klc_adj_song') || '{}') || {}; } catch (e) { return {}; }
  }

  _loadAdj() {
    if (!this._perSong) { this._adj = this._readGlobalAdj(); return; }
    this._adj = (this._key && Number(this._songAdjMap()[this._key])) || 0;
  }

  _saveAdj() {
    try {
      if (!this._perSong) { localStorage.setItem('klc_adj', String(this._adj)); return; }
      if (!this._key) return;
      const m = this._songAdjMap();
      if (this._adj) m[this._key] = this._adj; else delete m[this._key];
      const keys = Object.keys(m);
      if (keys.length > 500) keys.slice(0, keys.length - 500).forEach((k) => delete m[k]);
      localStorage.setItem('klc_adj_song', JSON.stringify(m));
    } catch (e) {}
  }

  _showOffset() {
    if (!this._el) return;
    const o = this._baseOffset + this._adj;
    this._el.offv.textContent = `${this._t.offset} ${o > 0 ? '+' : ''}${o.toFixed(2)}${this._t.sec}`;
  }

  /* ---------- выбор плеера ---------- */
  _active() {
    const h = this._hass;
    if (!h) return null;
    let paused = null;
    const ex = new Set(this._config.exclude_players);
    let ids = this._config.players.slice();
    if (this._config.players_mode === 'auto') {
      const all = Object.keys(h.states).filter((e) => e.startsWith('media_player.'));
      ids = ids.concat(all.filter((e) => !ids.includes(e)));
    }
    for (const id of ids) {
      if (ex.has(id)) continue;
      const s = h.states[id];
      if (!s || !s.attributes.media_title) continue;
      if (s.state === 'playing') return s;
      if (!paused && s.state === 'paused') paused = s;
    }
    return paused;
  }

  _update() {
    if (!this._el || !this._config) return;
    const s = this._active();
    this._player = s;
    this._playing = !!(s && s.state === 'playing');
    this._el.card.classList.toggle('playing', this._playing);
    if (!s) {
      this._el.cbg.style.backgroundImage = '';
      this._key = null;
      this._data = null;
      this._yr = '';
      this._mq(this._el.title, this._esc(this._config.title || this._t.title));
      this._artSig = null; this._artParts = null;
      this._el.artist.innerHTML = '';
      this._el.artist.classList.remove('cut');
      this._el.src.textContent = '';
      this._el.cover.style.backgroundImage = `url("${KLC_LOGO}")`;
      this._renderLines();
      this._setMsg(this._t.nothing);
      this._el.mode.textContent = '';
      return;
    }
    const a = s.attributes;
    this._titleText = a.media_title || '—';
    this._renderTitle();
    this._el.src.textContent = a.friendly_name || s.entity_id;
    const pic = a.entity_picture;
    this._el.cover.style.backgroundImage = pic ? `url("${pic}")` : `url("${KLC_LOGO}")`;
    if (pic !== this._pic) { this._pic = pic; this._el.cbg.style.backgroundImage = pic ? `url("${pic}")` : ''; }
    const key = `${a.media_artist || ''}|${a.media_title}`;
    if (key !== this._key) {
      this._key = key;
      if (this._perSong) { this._loadAdj(); this._showOffset(); }
      this._yr = '';
      this._renderTitle();
      this._load(a, key);
      if (this._config.show_year) this._loadYears(a, key);
    }
    this._renderArtist(a, this._years && this._yearsKey === key ? this._years.album : null);
  }

  _renderArtist(a, albumYear) {
    const parts = [];
    if (a.media_artist) parts.push(this._esc(a.media_artist));
    if (a.media_album_name) parts.push(`<b>${this._esc(a.media_album_name)}</b>${albumYear ? ', ' + albumYear : ''}`);
    const sig = parts.join('|');
    if (sig === this._artSig) return;
    this._artSig = sig;
    this._artParts = parts;
    this._artIdx = 0;
    this._artNext = performance.now() + 4000;
    this._artShow(parts[0] || '');
  }

  /* строка исполнителя: по очереди «исполнитель» и «альбом, год», плавно уезжают вверх и выезжают снизу */
  _artShow(html, roll) {
    const el = this._el.artist;
    el.innerHTML = `<span class="ai${roll ? ' down' : ''}">${html}</span>`;
    el.classList.toggle('cut', el.firstChild.scrollWidth > el.clientWidth + 1);
    if (roll) { void el.firstChild.offsetWidth; requestAnimationFrame(() => el.firstChild && el.firstChild.classList.remove('down')); }
  }

  _artTick(now) {
    const p = this._artParts;
    if (!p || p.length < 2 || !this._el || now < this._artNext) return;
    this._artNext = now + 5000 + 2400;
    const el = this._el.artist;
    if (el.firstChild && el.firstChild.classList) el.firstChild.classList.add('up');
    clearTimeout(this._artTo);
    this._artTo = setTimeout(() => {
      if (this._artParts !== p) return;
      this._artIdx = (this._artIdx + 1) % p.length;
      this._artShow(p[this._artIdx], true);
    }, 1100);
  }

  /* бегущая строка названия песни с мягкими краями: двигается, только если не помещается */
  /* название песни + год внутри одной бегущей строки */
  _renderTitle() {
    const yr = this._config.show_year && this._yr ? `<span class="yr">${this._esc(this._yr)}</span>` : '';
    this._mq(this._el.title, this._esc(this._titleText || '—') + yr);
  }

  _mq(el, html) {
    if (!el || el._mqHtml === html) return;
    el._mqHtml = html;
    this._mqFit(el);
  }

  _mqFit(el) {
    const html = el._mqHtml || '';
    el.classList.remove('run');
    if (el._mqAnim) { el._mqAnim.cancel(); el._mqAnim = null; }
    el.innerHTML = `<span class="mq">${html}</span>`;
    const inner = el.firstChild;
    if (!html || !el.clientWidth || inner.scrollWidth <= el.clientWidth + 1) return;
    el.classList.add('run');
    if (!inner.animate) return;
    /* появляется, стоит 2 с, плавно уезжает влево, пока не скроется целиком, 2 с пусто - и снова */
    const dist = inner.scrollWidth;
    const fade = 0.6, hold = 2, move = dist / 24, gap = 2;
    const T = fade + hold + move + gap;
    const x = (v) => `translate3d(${v}px, 0, 0)`;
    el._mqAnim = inner.animate([
      { offset: 0, transform: x(0), opacity: 0 },
      { offset: fade / T, transform: x(0), opacity: 1 },
      { offset: (fade + hold) / T, transform: x(0), opacity: 1, easing: 'cubic-bezier(.35, 0, .65, 1)' },
      { offset: (fade + hold + move) / T, transform: x(-dist), opacity: 1 },
      { offset: 1, transform: x(-dist), opacity: 1 },
    ], { duration: T * 1000, iterations: Infinity });
  }

  /* ---------- год песни и альбома (MusicBrainz) ---------- */
  async _loadYears(a, key) {
    this._years = null;
    let y = null;
    try {
      const raw = localStorage.getItem('klcy:' + key);
      if (raw) {
        const v = JSON.parse(raw);
        if (Date.now() - v.ts < KLC_CACHE_DAYS * 86400000) y = v.y;
      }
    } catch (e) {}
    if (!y) {
      const q = (t) => '"' + String(t).replace(/["\\]/g, ' ') + '"';
      const title = this._clean(a.media_title);
      const artist = String(a.media_artist || '').split(/,|&| feat\.? /i)[0].trim();
      let query = 'recording:' + q(title);
      if (artist) query += ' AND artist:' + q(artist);
      try {
        const res = await fetch('https://musicbrainz.org/ws/2/recording?fmt=json&limit=10&query=' + encodeURIComponent(query),
          { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const j = await res.json();
        const recs = (j.recordings || []).filter((r) => (r.score || 0) >= 80);
        const yr = (d) => (d && /^\d{4}/.test(d) ? d.slice(0, 4) : null);
        const songYears = recs.map((r) => yr(r['first-release-date'])).filter(Boolean).sort();
        const norm = (t) => String(t || '').toLowerCase().replace(/\s*[\(\[].*?[\)\]]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
        const album = norm(a.media_album_name);
        const albumYears = [];
        if (album) {
          recs.forEach((r) => (r.releases || []).forEach((rel) => {
            const n = norm(rel.title);
            if (n && (n === album || n.startsWith(album) || album.startsWith(n))) {
              const v = yr(rel.date);
              if (v) albumYears.push(v);
            }
          }));
          albumYears.sort();
        }
        y = { song: songYears[0] || null, album: albumYears[0] || null };
        try { localStorage.setItem('klcy:' + key, JSON.stringify({ ts: Date.now(), y })); } catch (e) {}
      } catch (e) { return; }
    }
    if (this._key !== key) return;
    this._years = y;
    this._yearsKey = key;
    this._yr = String(y.song || y.album || '');
    this._renderTitle();
    if (this._player) this._renderArtist(this._player.attributes, y.album);
  }

  /* ---------- кеш на 30 дней ---------- */
  _cacheGet(key) {
    try {
      const raw = localStorage.getItem('klc:' + key);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (Date.now() - v.ts > KLC_CACHE_DAYS * 86400000) { localStorage.removeItem('klc:' + key); return null; }
      return v.r;
    } catch (e) { return null; }
  }

  _cacheSet(key, r) {
    const v = JSON.stringify({ ts: Date.now(), r });
    try { localStorage.setItem('klc:' + key, v); } catch (e) {
      try {
        Object.keys(localStorage).filter((k) => k.startsWith('klc:')).forEach((k) => localStorage.removeItem(k));
        localStorage.setItem('klc:' + key, v);
      } catch (e2) {}
    }
  }

  /* ---------- загрузка текста ---------- */
  _clean(t) {
    return String(t || '')
      .replace(/\s*[-–]\s*(\d{4}\s*)?(remaster(ed)?|live|radio edit|mono|stereo|version|edit)\b.*$/i, '')
      .replace(/\s*[\(\[](feat|ft|with)\.?[^\)\]]*[\)\]]/ig, '')
      .trim();
  }

  async _load(a, key) {
    let r = this._cacheGet(key);
    if (!r) {
      this._data = null;
      this._renderLines();
      this._setMsg(this._t.searching);
      this._el.mode.textContent = '';
      const title = this._clean(a.media_title);
      const artist = String(a.media_artist || '').split(/,|&| feat\.? /i)[0].trim();
      try {
        const p = new URLSearchParams({ track_name: title, artist_name: artist });
        if (a.media_album_name) p.set('album_name', a.media_album_name);
        if (a.media_duration) p.set('duration', String(Math.round(a.media_duration)));
        let res = await fetch('https://lrclib.net/api/get?' + p.toString());
        if (res.ok) r = await res.json();
        if (!r || (!r.syncedLyrics && !r.plainLyrics)) {
          const q = new URLSearchParams({ track_name: title, artist_name: artist });
          res = await fetch('https://lrclib.net/api/search?' + q.toString());
          if (res.ok) {
            const arr = await res.json();
            r = (arr || []).find((x) => x.syncedLyrics) || (arr || [])[0] || null;
          }
        }
      } catch (e) {
        if (this._key === key) this._setMsg(this._t.net_error + (e && e.message ? e.message : e));
        return;
      }
      r = r ? { syncedLyrics: r.syncedLyrics || null, plainLyrics: r.plainLyrics || null } : { syncedLyrics: null, plainLyrics: null };
      this._cacheSet(key, r);
    }
    let data;
    if (r.syncedLyrics) { data = { type: 'synced', lines: this._parse(r.syncedLyrics) }; this._prepare(data); }
    else if (r.plainLyrics) data = { type: 'plain', lines: r.plainLyrics.split('\n').map((t) => ({ t: 0, text: t.trim() })) };
    else data = { type: 'none', lines: [] };
    if (this._key === key) this._apply(data);
  }

  _parse(lrc) {
    const out = [];
    const timeRe = /\[(\d+):(\d+(?:[.:]\d+)?)\]/g;
    for (const raw of String(lrc).split('\n')) {
      const stamps = [...raw.matchAll(timeRe)];
      if (!stamps.length) continue;
      let text = raw.replace(timeRe, '').trim();
      const words = [];
      const wre = /<(\d+):(\d+(?:\.\d+)?)>\s*([^<]*)/g;
      let m;
      while ((m = wre.exec(text))) {
        const w = m[3].trim();
        if (w) for (const part of w.split(/\s+/)) words.push({ t: +m[1] * 60 + parseFloat(m[2]), w: part });
      }
      if (words.length) text = words.map((x) => x.w).join(' ');
      for (const s of stamps) {
        out.push({
          t: +s[1] * 60 + parseFloat(String(s[2]).replace(':', '.')),
          text,
          words: words.length ? words.map((x) => ({ ...x })) : null,
        });
      }
    }
    out.sort((x, y) => x.t - y.t);
    return out;
  }

  _prepare(data) {
    const L = data.lines;
    data.wordSync = L.some((l) => l.words);
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      const next = i < L.length - 1 ? L[i + 1].t : l.t + 6;
      let end = next;
      if (next - l.t > 10) end = l.t + Math.max(2, l.text.length * 0.1 + 1);
      l.end = end;
      l.next = next;
      if (!l.text) continue;
      if (l.words) {
        for (let j = 0; j < l.words.length; j++) l.words[j].e = j < l.words.length - 1 ? l.words[j + 1].t : end;
      } else {
        const parts = l.text.split(/\s+/).filter(Boolean);
        const total = parts.reduce((s, p) => s + p.length, 0) || 1;
        let acc = 0;
        l.words = parts.map((p) => {
          const t0 = l.t + (acc / total) * (end - l.t);
          acc += p.length;
          return { w: p, t: t0, e: l.t + (acc / total) * (end - l.t) };
        });
      }
    }
    /* проигрыши: вступление, пустые строки, длинные паузы */
    const out = [];
    const firstText = L.find((l) => l.text);
    const gth = Number(this._config.gap_threshold) > 0 ? Number(this._config.gap_threshold) : 4;
    if (firstText && firstText.t > gth) out.push({ gap: true, t: 0, end: firstText.t });
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (!l.text) {
        if (i === 0 && out.length) continue;
        const prev = out[out.length - 1];
        if (prev && prev.gap) { prev.end = l.next; continue; }
        out.push({ gap: true, t: l.t, end: l.next });
        continue;
      }
      out.push(l);
      const nx = L[i + 1];
      if (nx && nx.text && nx.t - l.end > gth) out.push({ gap: true, t: l.end, end: nx.t });
    }
    data.lines = out;
  }

  _apply(data) {
    this._data = data;
    this._cur = -2;
    this._lastCd = '';
    if (this._el) this._el.card.classList.remove('cdon');
    this._renderLines();
    if (data.type === 'none') {
      this._setMsg(this._t.not_found);
      this._el.mode.textContent = '';
    } else if (data.type === 'plain') {
      this._setMsg('');
      this._el.mode.textContent = this._t.no_sync;
    } else {
      this._setMsg('');
      this._el.mode.textContent = data.wordSync ? this._t.sync_words : this._t.sync_lines;
    }
  }

  _setMsg(t) {
    this._el.msg.textContent = t;
    this._el.msg.style.display = t ? 'flex' : 'none';
  }

  _esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  _renderLines() {
    const d = this._data;
    this._el.lyr.classList.toggle('plain', !!(d && d.type === 'plain'));
    if (!d || !d.lines.length) { this._el.inner.innerHTML = ''; this._lineEls = []; return; }
    if (d.type === 'plain') {
      this._el.inner.innerHTML = d.lines.map((l) =>
        `<div class="ln"${(this._config.direction === 'rtl' || (this._config.direction !== 'ltr' && KLC_RTL.test(l.text))) ? ' dir="rtl"' : ''}>${l.text ? l.text.split(/\s+/).map((w) => `<span class="w">${this._esc(w)}</span>`).join('') : '&nbsp;'}</div>`).join('');
      this._lineEls = [];
      return;
    }
    const note = (n) => `<span class="nt n${n}">♪<span class="f">♪</span></span>`;
    const dirOpt = this._config.direction;
    const dirOf = (t) => (dirOpt === 'rtl' || (dirOpt !== 'ltr' && KLC_RTL.test(t)) ? ' dir="rtl"' : '');

    this._el.inner.innerHTML = d.lines.map((l) => l.gap
      ? `<div class="ln gap">${note(1)}${note(2)}${note(3)}</div>`
      : `<div class="ln"${dirOf(l.text)}>${l.words.map((w) => `<span class="w">${this._esc(w.w)}<span class="f">${this._esc(w.w)}</span></span>`).join('')}</div>`).join('');
    this._lineEls = [...this._el.inner.querySelectorAll('.ln')].map((el) => ({
      el, words: [...el.querySelectorAll('.f')] }));
    this._lastCd = '';
  }

  /* ---------- синхронизация ---------- */
  _position() {
    const s = this._player;
    if (!s) return null;
    const a = s.attributes;
    if (typeof a.media_position !== 'number') return null;
    let pos = a.media_position;
    if (s.state === 'playing' && a.media_position_updated_at) {
      pos += (Date.now() - Date.parse(a.media_position_updated_at)) / 1000;
    }
    return pos + this._baseOffset + this._adj;
  }

  _setupVu() {
    const cv = this._el.vu;
    const W = Math.round(cv.getBoundingClientRect().width) || Number(this._config.visualizer_width) || 220;
    const H = 64, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    const x = cv.getContext && cv.getContext('2d');
    if (!x) { this._vu = null; return; }
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const N = Math.max(14, Math.round(W / 5)), TY = 0.6, TR = 0.82, half = (H - 8) / 2;
    const fy = (t) => Math.min(1, Math.max(0, 0.5 - (t * half) / H));
    const gr = x.createLinearGradient(0, 0, 0, H);
    [[0, '#ff3b30'], [fy(TR), '#ff3b30'], [fy(TY), '#ffd60a'], [fy(0.4), '#34c759'],
     [1 - fy(0.4), '#34c759'], [1 - fy(TY), '#ffd60a'], [1 - fy(TR), '#ff3b30'], [1, '#ff3b30']]
      .forEach(([o, c]) => gr.addColorStop(o, c));
    this._vu = {
      x, W, H, N, TY, TR, half, cy: H / 2, gr, flash: 0, beat: 0, beatNext: 0, next: 0, idle: false,
      bars: Array.from({ length: N }, (_, i) => ({ v: 0, t: 0, p: 0, hold: 0, env: Math.pow(Math.sin(((i + 0.5) / N) * Math.PI), 0.7) })),
    };
  }

  _vuTick(now, dt) {
    const u = this._vu;
    if (!u || !this._config.show_visualizer) return;
    const lv = this._micLevels(u.N);
    if (this._el) this._el.card.classList.toggle('micon', !!lv);
    if (lv) {
      u.beat = 0;
      u.bars.forEach((b, i) => { b.t = lv[i]; });
    }
    const on = lv ? true : this._playing;
    if (!on && u.idle) return;
    if (lv) { /* уровни уже из микрофона */ } else if (on && now > u.beatNext) { u.beatNext = now + 420 + Math.random() * 260; u.beat = 1; }
    u.beat = Math.max(0, u.beat - dt * 3.2);
    if (!lv && on && now > u.next) {
      u.next = now + 85 + Math.random() * 60;
      let prev = 0.5;
      u.bars.forEach((b) => { const r = Math.pow(Math.random(), 0.55); b.t = Math.min(1, 0.7 * r + 0.3 * prev); prev = b.t; });
    }
    let over = false, idle = true;
    u.bars.forEach((b) => {
      const tg = !on ? 0 : lv ? Math.min(1, b.t * (0.55 + 0.45 * b.env)) : Math.min(1, (b.t * 0.78 + u.beat * 0.4) * b.env);
      b.v += (tg - b.v) * Math.min(1, dt * 15);
      if (b.v > b.p) { b.p = b.v; b.hold = 0.5; } else if (b.hold > 0) b.hold -= dt; else b.p = Math.max(0, b.p - dt * 0.5);
      if (b.v > u.TR) over = true;
      if (b.v > 0.01 || b.p > 0.01) idle = false;
    });
    u.flash = over ? 1 : Math.max(0, u.flash - dt * 2.5);
    const { x, W, H, N, TY, TR, half, cy } = u;
    x.clearRect(0, 0, W, H);
    /* столбики и пики */
    const bw = 3, gap = (W - N * bw) / (N - 1);
    u.bars.forEach((b, i) => {
      const X = i * (bw + gap);
      x.globalAlpha = 0.35 + 0.65 * b.env;
      const bh = Math.max(2, b.v * half * 2);
      x.fillStyle = u.gr;
      x.beginPath();
      if (x.roundRect) x.roundRect(X, cy - bh / 2, bw, bh, 1.5); else x.rect(X, cy - bh / 2, bw, bh);
      x.fill();
      if (b.p > 0.04) {
        x.fillStyle = b.p > TR ? '#ff3b30' : b.p > TY ? '#ffd60a' : 'rgba(255,255,255,.6)';
        if (b.p > TR) { x.shadowColor = '#ff3b30'; x.shadowBlur = 5; }
        const py = b.p * half;
        x.fillRect(X, cy - py - 3, bw, 1.5);
        x.fillRect(X, cy + py + 1.5, bw, 1.5);
        x.shadowBlur = 0;
      }
    });
    x.globalAlpha = 1;
    u.idle = !on && idle;
  }

  _progress() {
    if (!this._config.show_progress || !this._el) return;
    const s = this._player;
    const dur = s && Number(s.attributes.media_duration);
    let pos = null;
    if (s && typeof s.attributes.media_position === 'number') {
      pos = s.attributes.media_position;
      if (s.state === 'playing' && s.attributes.media_position_updated_at) {
        pos += (Date.now() - Date.parse(s.attributes.media_position_updated_at)) / 1000;
      }
    }
    const fmt = (t) => { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    const pct = pos !== null && dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
    this._el.pgf.style.width = pct.toFixed(2) + '%';
    const txt = pos === null ? '' : dur > 0 ? `${fmt(pos)} / ${fmt(dur)}` : fmt(pos);
    if (txt !== this._tmTxt) { this._tmTxt = txt; this._el.tm.textContent = txt; }
  }

  _frame() {
    this._raf = requestAnimationFrame(() => this._frame());
    const now = performance.now();
    const dt = Math.min(0.1, (now - (this._lastT || now)) / 1000);
    this._lastT = now;
    this._vuTick(now, dt);
    this._artTick(now);
    this._progress();
    const d = this._data;
    if (!d || d.type !== 'synced' || !this._lineEls || !this._lineEls.length) return;
    const pos = this._position();
    if (pos === null) {
      if (this._el.mode.textContent.indexOf(this._t.no_position) < 0) this._el.mode.textContent += ' · ' + this._t.no_position;
      return;
    }
    const L = d.lines;
    let cur = -1;
    for (let i = 0; i < L.length; i++) { if (pos >= L[i].t) cur = i; else break; }

    if (cur !== this._cur) {
      this._cur = cur;
      const base = Math.max(cur, 0);
      this._lineEls.forEach((le, i) => {
        const k = i - base;
        le.el.className = 'ln ' + (L[i].gap ? 'gap ' : '') + (k === 0 ? 'd0' : k === 1 ? 'd1' : k === 2 ? 'd2' : k === 3 ? 'd3' : k === -1 ? 'dm1' : k < -1 ? 'up' : '');
        if (i !== cur) le.words.forEach((f) => { f.style.width = i < cur ? '100%' : '0'; });
      });
    }
    let cd = '';
    const line = cur >= 0 ? L[cur] : null;
    const le = cur >= 0 ? this._lineEls[cur] : null;
    if (line && line.gap) {
      const p = Math.min(1, Math.max(0, (pos - line.t) / Math.max(0.1, line.end - line.t)));
      le.words.forEach((f, j) => { f.style.width = (Math.max(0, Math.min(1, p * 3 - j)) * 100).toFixed(1) + '%'; });
      const lead = Math.max(0, Number(this._config.countdown_lead) || 0);
      const rem = line.end - pos - lead;
      const hold0 = Math.min(0.5, lead);
      if (this._config.show_countdown && rem <= 3 && rem > -hold0 && line.end - line.t >= 3.5 + lead) {
        cd = rem <= 0.4 ? '0' : String(Math.ceil(rem));
        const a = cd === '0' ? 360 : (1 - (rem % 1 || 1)) * 360;
        this._el.sweep.style.background = `conic-gradient(color-mix(in srgb, var(--cd) 35%, transparent) ${a}deg, color-mix(in srgb, var(--cd) 6%, transparent) ${a}deg)`;
        this._el.hand.setAttribute('transform', `rotate(${a} 110 110)`);
      }
    }
    const gapOn = !!(line && line.gap);
    if (gapOn !== this._gapOn) { this._gapOn = gapOn; this._el.lyr.classList.toggle('gapon', gapOn); }
    if (cd !== this._lastCd) {
      if (cd && !this._lastCd) {
        const r = this._el.card.getBoundingClientRect();
        const ld = Math.round(Math.min(r.width, r.height) * 0.92);
        if (ld > 60) this._el.card.style.setProperty('--ld', ld + 'px');
      }
      this._lastCd = cd;
      this._el.card.classList.toggle('cdon', !!cd);
      const dg = this._el.dg;
      dg.textContent = cd;
      dg.className = 'dg';
      void dg.offsetWidth;
      if (cd) {
        dg.classList.add('e' + cd);
        if (cd === '0') { const w = this._el.wave; w.className = 'wave'; void w.offsetWidth; w.className = 'wave go'; }
      }
    }
    if (!line || line.gap) return;
    const els = le.words;
    for (let j = 0; j < line.words.length && j < els.length; j++) {
      const w = line.words[j];
      let p = 0;
      if (pos >= w.e) p = 100;
      else if (pos > w.t) p = ((pos - w.t) / Math.max(0.05, w.e - w.t)) * 100;
      els[j].style.width = p.toFixed(1) + '%';
    }
  }
}

/* ---------- визуальный редактор ---------- */
const num = (min, max, step, unit) => ({ number: { min, max, step, mode: 'slider', unit_of_measurement: unit } });
const box = (min, max, step, unit) => ({ number: { min, max, step, mode: 'box', unit_of_measurement: unit } });
const sel = (options) => ({ select: { mode: 'dropdown', options } });

const klcSchema = (t) => {
  const O = t.O, sec = t.sec;
  return [
  { type: 'expandable', name: '', title: t.S.sources, icon: 'mdi:speaker-multiple', expanded: true, flatten: true, schema: [
    { name: 'players_mode', selector: sel([
      { value: 'list', label: O.list },
      { value: 'auto', label: O.auto },
    ]) },
    { name: 'players', selector: { entity: { multiple: true, filter: { domain: 'media_player' } } } },
    { name: 'exclude_players', selector: { entity: { multiple: true, filter: { domain: 'media_player' } } } },
    { name: 'lyrics_provider', selector: sel([{ value: 'lrclib', label: O.lrclib }]) },
    { name: 'show_year', selector: { boolean: {} } },
  ] },
  { type: 'expandable', name: '', title: t.S.view, icon: 'mdi:format-text', flatten: true, schema: [
    { name: 'layout', selector: sel([
      { value: 'fog', label: O.fog },
      { value: 'two_line', label: O.two_line },
      { value: 'compact', label: O.compact },
    ]) },
    { name: 'font_size', selector: num(12, 48, 1, 'px') },
    { name: 'font_weight', selector: sel([
      { value: 400, label: O.w400 }, { value: 500, label: O.w500 },
      { value: 700, label: O.w700 }, { value: 800, label: O.w800 },
    ]) },
    { name: 'font_family', selector: { text: {} } },
    { name: 'line_spacing', selector: num(2, 4, 0.05, '') },
    { type: 'grid', name: '', schema: [
      { name: 'alignment', selector: sel([
        { value: 'left', label: O.left }, { value: 'center', label: O.center }, { value: 'right', label: O.right },
      ]) },
      { name: 'direction', selector: sel([
        { value: 'auto', label: O.dir_auto }, { value: 'ltr', label: O.ltr }, { value: 'rtl', label: O.rtl },
      ]) },
    ] },
    { name: 'height', selector: box(60, 900, 10, 'px') },
  ] },
  { type: 'expandable', name: '', title: t.S.colors, icon: 'mdi:palette', flatten: true, schema: [
    { name: 'fill_color', selector: { color_rgb: {} } },
    { name: 'text_color', selector: { color_rgb: {} } },
    { name: 'countdown_color', selector: { color_rgb: {} } },
  ] },
  { type: 'expandable', name: '', title: t.S.fog, icon: 'mdi:weather-fog', flatten: true, schema: [
    { name: 'fog_strength', selector: num(0, 45, 1, '%') },
    { name: 'show_background', selector: { boolean: {} } },
    { name: 'background_blur', selector: num(0, 60, 1, 'px') },
    { name: 'background_brightness', selector: num(10, 90, 1, '%') },
  ] },
  { type: 'expandable', name: '', title: t.S.breaks, icon: 'mdi:timer-sand', flatten: true, schema: [
    { name: 'gap_threshold', selector: num(2, 12, 0.5, sec) },
    { name: 'show_countdown', selector: { boolean: {} } },
    { name: 'countdown_lead', selector: num(0, 5, 0.5, sec) },
  ] },
  { type: 'expandable', name: '', title: t.S.decor, icon: 'mdi:creation', flatten: true, schema: [
    { name: 'show_decor', selector: { boolean: {} } },
    { name: 'decor_count', selector: num(1, 8, 1, '') },
    { name: 'decor_opacity', selector: num(5, 60, 1, '%') },
    { name: 'show_visualizer', selector: { boolean: {} } },
    { name: 'visualizer_source', selector: sel([{ value: 'animation', label: O.animation }, { value: 'mic', label: O.mic }]) },
    { name: 'visualizer_width', selector: num(80, 400, 10, 'px') },
  ] },
  { type: 'expandable', name: '', title: t.S.panel, icon: 'mdi:tune-variant', flatten: true, schema: [
    { type: 'grid', name: '', schema: [
      { name: 'show_header', selector: { boolean: {} } },
      { name: 'show_progress', selector: { boolean: {} } },
      { name: 'show_mode', selector: { boolean: {} } },
      { name: 'show_offset', selector: { boolean: {} } },
    ] },
    { name: 'offset_mode', selector: sel([{ value: 'song', label: O.song }, { value: 'global', label: O.global }]) },
    { name: 'offset', selector: box(-10, 10, 0.01, sec) },
    { name: 'title', selector: { text: {} } },
  ] },
];
};

const KLC_COLOR_KEYS = ['fill_color', 'text_color', 'countdown_color'];
const klcHexToRgb = (v) => {
  if (Array.isArray(v)) return v;
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(v || '').trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : undefined;
};

class KaraokeLyricsCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const lg = klcLang(hass);
    if (lg !== this._lang) { this._lang = lg; if (this._config) this._render(); return; }
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!this._lang) this._lang = klcLang(this._hass);
    if (!this._form) {
      const on = '#34c759', off = '#ff3b30', knob = '#ffffff';
      Object.entries({
        '--ha-switch-checked-background-color': on, '--ha-switch-checked-background-color-hover': on,
        '--ha-switch-checked-thumb-background-color': knob, '--ha-switch-checked-thumb-background-color-hover': knob,
        '--ha-switch-background-color': off, '--ha-switch-background-color-hover': off,
        '--ha-switch-thumb-background-color': knob, '--ha-switch-thumb-background-color-hover': knob,
        '--ha-switch-border-color': 'transparent',
        '--switch-checked-color': on, '--switch-checked-track-color': on, '--switch-checked-button-color': knob,
        '--switch-unchecked-color': off, '--switch-unchecked-track-color': off, '--switch-unchecked-button-color': knob,
      }).forEach(([k, v]) => this.style.setProperty(k, v));
      this._form = document.createElement('ha-form');
      this._form.computeLabel = (s) => klcT(this._lang).L[s.name] || s.name;
      this._form.computeHelper = (s) => klcT(this._lang).H[s.name];
      this._form.addEventListener('value-changed', (ev) => {
        const cfg = Object.assign({}, ev.detail.value);
        Object.keys(cfg).forEach((k) => {
          const v = cfg[k];
          if (v === '' || v === undefined || v === null || (Array.isArray(v) && !v.length && k !== 'players')) delete cfg[k];
          else if (KLC_DEFAULTS[k] !== undefined && !Array.isArray(v) && v === KLC_DEFAULTS[k] && k !== 'players_mode') delete cfg[k];
        });
        if (!cfg.players) cfg.players = [];
        this._config = cfg;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = Object.assign({}, KLC_DEFAULTS, this._config);
    KLC_COLOR_KEYS.forEach((k) => { data[k] = klcHexToRgb(data[k]); });
    data.players = klcList(data.players);
    data.exclude_players = klcList(data.exclude_players);
    this._form.hass = this._hass;
    this._form.schema = klcSchema(klcT(this._lang));
    this._form.data = data;
  }
}

console.info(
  '%c KARAOKE-LYRICS-CARD %c v' + KLC_VERSION + ' ',
  'color:#fff;background:#34c759;font-weight:700',
  'color:#34c759;background:#1c1c1c'
);

if (!customElements.get('karaoke-lyrics-card-editor')) {
  customElements.define('karaoke-lyrics-card-editor', KaraokeLyricsCardEditor);
}
if (!customElements.get('karaoke-lyrics-card')) {
  customElements.define('karaoke-lyrics-card', KaraokeLyricsCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'karaoke-lyrics-card',
    name: 'Karaoke Lyrics Card',
    description: klcT(klcLang(null)).description,
    preview: false,
  });
}
