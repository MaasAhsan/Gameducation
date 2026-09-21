"use strict";

const QUESTIONS = window.GD_QUESTIONS || [];
const CATEGORIES = [
  { key: "sejarah", label: "Sejarah", icon: "landmark" },
  { key: "geografi", label: "Geografi", icon: "map" },
  { key: "sains", label: "Sains", icon: "flask" },
  { key: "budaya", label: "Budaya", icon: "palette" },
  { key: "olahraga", label: "Olahraga", icon: "trophy" },
];
const DIFFICULTIES = [
  { key: "mudah", label: "Mudah" },
  { key: "sedang", label: "Sedang" },
  { key: "sulit", label: "Sulit" },
];
const TIME_BY_DIFFICULTY = { mudah: 20, sedang: 25, sulit: 30 };
const POINTS_MULTIPLIER = { mudah: 1, sedang: 1.5, sulit: 2 };
const GEM_BY_DIFF = { mudah: 5, sedang: 8, sulit: 12 };
const DEFAULT_QUESTION_COUNT = 10;
const MIN_QUESTIONS_TO_START = 8;
const SETTINGS_KEY = "gameducation:settings";
const LEADERBOARD_KEY = "gameducation:leaderboard";
const LOCAL_PROFILE_KEY = "gameducation:profile";
const LOCAL_SETS_KEY = "gameducation:sets";
const COLLECTIBLES = [
  { id: "pemula", name: "Lencana Pemula", blurb: "Selesaikan kuis pertama", cost: 0, auto: "first" },
  { id: "rajin", name: "Rajin Belajar", blurb: "Tukar 40 permata", cost: 40 },
  { id: "batik", name: "Motif Kawung", blurb: "Tukar 60 permata", cost: 60 },
  { id: "cendekia", name: "Cendekia", blurb: "Tukar 80 permata", cost: 80 },
  { id: "parang", name: "Motif Parang", blurb: "Tukar 90 permata", cost: 90 },
  { id: "jawara", name: "Jawara Kelas", blurb: "Tukar 120 permata", cost: 120 },
  { id: "garuda", name: "Sayap Garuda", blurb: "Tukar 150 permata", cost: 150 },
  { id: "nusantara", name: "Nusantara", blurb: "Tukar 200 permata", cost: 200 },
];

const lightVars = {
  "--gd-bg": "#F6F1E7",
  "--gd-bg-elevated": "#FFFFFF",
  "--gd-text": "#1E2430",
  "--gd-text-muted": "#5B6472",
  "--gd-border": "rgba(30,36,48,0.12)",
  "--gd-accent": "#2F4C7A",
  "--gd-accent-soft": "rgba(47,76,122,0.10)",
  "--gd-success": "#3F7D58",
  "--gd-success-soft": "rgba(63,125,88,0.12)",
  "--gd-error": "#B23A48",
  "--gd-error-soft": "rgba(178,58,72,0.12)",
  "--gd-warning": "#C08A2E",
  "--gd-on-accent": "#FBF9F4",
};
const darkVars = {
  "--gd-bg": "#12151C",
  "--gd-bg-elevated": "#1B2029",
  "--gd-text": "#EDE7D9",
  "--gd-text-muted": "#9AA3B2",
  "--gd-border": "rgba(237,231,217,0.14)",
  "--gd-accent": "#7C9CC4",
  "--gd-accent-soft": "rgba(124,156,196,0.16)",
  "--gd-success": "#6FBE8C",
  "--gd-success-soft": "rgba(111,190,140,0.16)",
  "--gd-error": "#E08A93",
  "--gd-error-soft": "rgba(224,138,147,0.16)",
  "--gd-warning": "#E0B15C",
  "--gd-on-accent": "#12151C",
};

const ICONS = {
  landmark: '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><line x1="7" y1="16" x2="17" y2="16"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  volume2: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  volumeX: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  rotateCcw: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  listChecks: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  sparkles: '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
  shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  logIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  gem: '<polygon points="6 3 18 3 22 9 12 21 2 9"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
};

function icon(name, size, cls) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : "") + ">" + (ICONS[name] || "") + "</svg>";
}
function escapeHTML(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function storageGet(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) {}
}
function categoryLabel(key) {
  if (key === "semua" || key === "campuran") return "Semua";
  const c = CATEGORIES.find((x) => x.key === key);
  return c ? c.label : key;
}
function difficultyLabel(key) {
  if (key === "campuran") return "Campuran";
  const d = DIFFICULTIES.find((x) => x.key === key);
  return d ? d.label : key;
}
function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  if (m <= 0) return s + " detik";
  return m + " menit " + s + " detik";
}
function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}
function filterPool(cat, diff, extra) {
  let pool = QUESTIONS.filter((q) => (cat === "semua" || q.cat === cat) && (diff === "campuran" || q.diff === diff));
  if (extra && extra.length) pool = pool.concat(extra);
  return pool;
}
function buildSessionQuestions(pool, count, shuffleQ) {
  const picked = (shuffleQ !== false ? shuffleArray(pool) : pool.slice()).slice(0, count);
  return picked.map((q) => {
    const src = q.o || q.options;
    const withIdx = src.map((opt, idx) => ({ opt, idx }));
    const shuffled = shuffleArray(withIdx);
    return {
      id: q.id,
      q: q.q || q.prompt,
      cat: q.cat || q.category || "campuran",
      diff: q.diff || q.difficulty || "sedang",
      options: shuffled.map((s) => s.opt),
      correctIndex: shuffled.findIndex((s) => s.idx === (q.a != null ? q.a : q.correct_index)),
      ex: q.ex || q.explanation || "",
      timeLimit: TIME_BY_DIFFICULTY[q.diff || q.difficulty] || 20,
      multiplier: POINTS_MULTIPLIER[q.diff || q.difficulty] || 1,
    };
  });
}

const state = {
  view: "splash",
  theme: "light",
  sound: true,
  leaderboard: [],
  category: "semua",
  difficulty: "campuran",
  lastResult: null,
  resetConfirm: false,
  nameInput: "",
  savedNotice: false,
  settingsOpen: false,
  authOpen: false,
  authMode: "login",
  authEmail: "",
  authPassword: "",
  authName: "",
  authError: "",
  user: null,
  profile: { display_name: "Tamu", gems: 0, streak: 0, inventory: ["pemula"], last_play_date: null, daily_claimed_on: null, is_guest: true },
  questionSource: "bank",
  customSetId: "",
  customSets: [],
  editor: null,
  roomSettings: {
    questionCount: 10,
    timeOverride: 0,
    shuffleQuestions: true,
    waitForAll: true,
    showExplanation: true,
    lateJoin: false,
    pointsMultiplier: 1,
  },
};

let quiz = null;
let quizTimeLeft = 0;
let quizTimeLimit = 0;
let quizSelected = null;
let quizAnswered = false;
let quizInterval = null;
let quizAdvanceTimeout = null;
let audioCtx = null;
let supabase = null;

const party = {
  role: null,
  channel: null,
  code: null,
  sendId: null,
  myId: null,
  myName: "",
  studentForm: { name: "", code: "" },
  connected: false,
  _hasSnap: false,
  _myAnswered: null,
  players: [],
  phase: "lobby",
  questionNumber: 0,
  total: 0,
  q: null,
  correctIndex: -1,
  timeLimit: 0,
  timeLeft: 0,
  submissions: {},
  scores: {},
  leaderboard: [],
  settings: {},
  error: "",
  ex: "",
  revealed: false,
};

(function loadPersisted() {
  const s = storageGet(SETTINGS_KEY);
  if (s) {
    if (s.theme) state.theme = s.theme;
    if (typeof s.sound === "boolean") state.sound = s.sound;
  }
  const lb = storageGet(LEADERBOARD_KEY);
  if (Array.isArray(lb)) state.leaderboard = lb;
  const p = storageGet(LOCAL_PROFILE_KEY);
  if (p) state.profile = Object.assign(state.profile, p);
  const sets = storageGet(LOCAL_SETS_KEY);
  if (Array.isArray(sets)) state.customSets = sets;
})();

function persistSettings() {
  storageSet(SETTINGS_KEY, { theme: state.theme, sound: state.sound });
}
function persistProfile() {
  storageSet(LOCAL_PROFILE_KEY, state.profile);
}
function persistSets() {
  storageSet(LOCAL_SETS_KEY, state.customSets);
}

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}
function playTone(kind) {
  if (!state.sound) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (kind === "correct") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(760, now);
    osc.frequency.exponentialRampToValueAtTime(1160, now + 0.14);
  } else if (kind === "wrong") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
  } else {
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.start(now);
  osc.stop(now + 0.3);
}

function initSupabase() {
  const cfg = window.GD_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
  try {
    supabase = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  } catch (e) {
    supabase = null;
  }
}

async function refreshSession() {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  state.user = data && data.session ? data.session.user : null;
  if (state.user) await loadRemoteProfile();
}

async function loadRemoteProfile() {
  if (!supabase || !state.user) return;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", state.user.id).maybeSingle();
  if (error || !data) return;
  const inv = await supabase.from("inventory").select("item_id").eq("user_id", state.user.id);
  state.profile = {
    display_name: data.display_name || state.profile.display_name,
    gems: Math.max(data.gems || 0, state.profile.gems || 0),
    streak: data.streak || 0,
    last_play_date: data.last_play_date,
    daily_claimed_on: data.daily_claimed_on,
    inventory: ((inv.data || []).map((r) => r.item_id)).concat(state.profile.inventory || []).filter((v, i, a) => a.indexOf(v) === i),
    is_guest: false,
  };
  persistProfile();
  const { data: sets } = await supabase.from("question_sets").select("id,title,description,is_public").eq("owner_id", state.user.id);
  if (sets) {
    const remote = [];
    for (const s of sets) {
      const qs = await supabase.from("custom_questions").select("*").eq("set_id", s.id).order("sort_order");
      remote.push({
        id: s.id,
        title: s.title,
        description: s.description,
        is_public: s.is_public,
        remote: true,
        questions: (qs.data || []).map((q) => ({
          id: q.id,
          q: q.prompt,
          o: q.options,
          a: q.correct_index,
          ex: q.explanation,
          cat: q.category,
          diff: q.difficulty,
        })),
      });
    }
    const localOnly = state.customSets.filter((s) => !s.remote);
    state.customSets = remote.concat(localOnly);
    persistSets();
  }
}

async function saveRemoteProfile() {
  if (!supabase || !state.user) return;
  await supabase.from("profiles").upsert({
    id: state.user.id,
    display_name: state.profile.display_name,
    gems: state.profile.gems,
    streak: state.profile.streak,
    last_play_date: state.profile.last_play_date,
    daily_claimed_on: state.profile.daily_claimed_on,
    is_guest: false,
    updated_at: new Date().toISOString(),
  });
}

function addGems(amount, reason) {
  state.profile.gems = Math.max(0, (state.profile.gems || 0) + amount);
  if (!state.profile.inventory) state.profile.inventory = [];
  if (reason === "first" && state.profile.inventory.indexOf("pemula") < 0) state.profile.inventory.push("pemula");
  persistProfile();
  saveRemoteProfile();
}

window.claimDaily = function () {
  if (state.profile.daily_claimed_on === todayStamp()) return 0;
  addGems(15, "daily");
  state.profile.daily_claimed_on = todayStamp();
  persistProfile();
  saveRemoteProfile();
  render();
  return 15;
};

function recordPlay(result) {
  const last = state.profile.last_play_date;
  const today = todayStamp();
  if (last === today) {
    /* same day */
  } else {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yday = y.toISOString().slice(0, 10);
    state.profile.streak = last === yday ? (state.profile.streak || 0) + 1 : 1;
    state.profile.last_play_date = today;
  }
  let gems = 0;
  (result.answers || []).forEach((a) => {
    if (a.isCorrect) gems += GEM_BY_DIFF[a.difficulty] || 6;
  });
  if (result.accuracy >= 80) gems += 10;
  if ((state.profile.inventory || []).indexOf("pemula") < 0) {
    state.profile.inventory = (state.profile.inventory || []).concat(["pemula"]);
  }
  addGems(gems, "match");
  result.gemsEarned = gems;
  if (supabase && state.user) {
    supabase.from("match_history").insert({
      user_id: state.user.id,
      mode: result.mode || "solo",
      score: result.score,
      accuracy: result.accuracy,
      gems_earned: gems,
      category: result.category,
      difficulty: result.difficulty,
    }).then(function () {});
  }
}

window.goView = function (v) {
  state.view = v;
  state.settingsOpen = false;
  render();
};
window.goHome = function () {
  if (quiz && state.view === "quiz") {
    if (!window.confirm("Keluar dari kuis yang sedang berjalan?")) return;
  }
  leaveParty();
  clearInterval(quizInterval);
  clearTimeout(quizAdvanceTimeout);
  quiz = null;
  state.lastResult = null;
  state.settingsOpen = false;
  state.view = "setup";
  render();
};
window.openSettings = function () {
  state.settingsOpen = true;
  render();
};
window.closeSettings = function () {
  state.settingsOpen = false;
  render();
};
window.toggleSound = function () {
  state.sound = !state.sound;
  persistSettings();
  render();
};
window.toggleTheme = function () {
  state.theme = state.theme === "dark" ? "light" : "dark";
  persistSettings();
  document.body.style.backgroundColor = state.theme === "dark" ? "#12151C" : "#F6F1E7";
  render();
};
window.setCategory = function (k) { state.category = k; render(); };
window.setDifficulty = function (d) { state.difficulty = d; render(); };
window.setNameInput = function (v) { state.nameInput = v; };
window.setQuestionSource = function (v) { state.questionSource = v; render(); };
window.setCustomSetId = function (v) { state.customSetId = v; render(); };
window.setRoomSetting = function (key, value) {
  state.roomSettings[key] = value;
  render();
};

window.startQuiz = function () {
  const pack = currentPack();
  if (pack.pool.length < MIN_QUESTIONS_TO_START && state.questionSource === "bank") {
    return;
  }
  const count = Math.min(state.roomSettings.questionCount || DEFAULT_QUESTION_COUNT, pack.pool.length);
  const questions = buildSessionQuestions(pack.pool, count, true);
  if (!questions.length) return;
  clearInterval(quizInterval);
  clearTimeout(quizAdvanceTimeout);
  quiz = { questions, index: 0, answers: [], score: 0, startedAt: Date.now(), poolSize: pack.pool.length };
  state.view = "quiz";
  startQuestion();
};

function currentPack() {
  if (state.questionSource === "custom") {
    const set = state.customSets.find((s) => s.id === state.customSetId);
    return { pool: set ? set.questions : [], label: set ? set.title : "Set kustom" };
  }
  return { pool: filterPool(state.category, state.difficulty), label: "Bank soal" };
}

function startQuestion() {
  const q = quiz.questions[quiz.index];
  quizTimeLimit = TIME_BY_DIFFICULTY[q.diff] || 20;
  quizTimeLeft = quizTimeLimit;
  quizSelected = null;
  quizAnswered = false;
  clearInterval(quizInterval);
  clearTimeout(quizAdvanceTimeout);
  render();
  quizInterval = setInterval(() => {
    quizTimeLeft -= 1;
    if (quizTimeLeft <= 0) {
      quizTimeLeft = 0;
      updateQuizClock();
      clearInterval(quizInterval);
      commitAnswer(-1);
    } else updateQuizClock();
  }, 1000);
}

function updateQuizClock() {
  const t = document.getElementById("quiz-time");
  const bar = document.getElementById("quiz-progress");
  if (t) t.textContent = quizTimeLeft + "s";
  if (bar) {
    const pct = Math.round((quizTimeLeft / quizTimeLimit) * 100);
    bar.style.width = pct + "%";
    bar.style.background = pct > 50 ? "var(--gd-accent)" : pct > 20 ? "var(--gd-warning)" : "var(--gd-error)";
  }
}

window.onOptionClick = function (optionIndex) {
  if (quizAnswered) return;
  clearInterval(quizInterval);
  commitAnswer(optionIndex);
};

function commitAnswer(optionIndex) {
  if (quizAnswered) return;
  const q = quiz.questions[quiz.index];
  quizSelected = optionIndex;
  quizAnswered = true;
  const isCorrect = optionIndex === q.correctIndex;
  playTone(isCorrect ? "correct" : "wrong");
  const basePoints = 100 * (POINTS_MULTIPLIER[q.diff] || 1);
  const timeBonus = isCorrect ? Math.round((quizTimeLeft / quizTimeLimit) * 40) : 0;
  quiz.answers.push({
    question: q.q,
    options: q.options,
    correctIndex: q.correctIndex,
    selectedIndex: optionIndex,
    isCorrect,
    category: q.cat,
    difficulty: q.diff,
    explanation: q.ex,
  });
  quiz.score += isCorrect ? Math.round(basePoints + timeBonus) : 0;
  render();
  quizAdvanceTimeout = setTimeout(() => {
    quiz.index += 1;
    if (quiz.index >= quiz.questions.length) finishQuiz();
    else startQuestion();
  }, 1100);
}

function finishQuiz() {
  clearInterval(quizInterval);
  clearTimeout(quizAdvanceTimeout);
  const correctCount = quiz.answers.filter((a) => a.isCorrect).length;
  const total = quiz.questions.length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  state.lastResult = {
    score: quiz.score,
    correctCount,
    total,
    accuracy,
    timeSeconds: Math.round((Date.now() - quiz.startedAt) / 1000),
    category: state.category,
    difficulty: state.difficulty,
    answers: quiz.answers,
    mode: "solo",
  };
  recordPlay(state.lastResult);
  state.nameInput = state.profile.display_name || "";
  state.savedNotice = false;
  quiz = null;
  state.view = "results";
  render();
}

window.saveScore = function () {
  if (!state.lastResult) return;
  const name = (state.nameInput || state.profile.display_name || "Pemain").trim().slice(0, 20);
  const entry = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    name,
    score: state.lastResult.score,
    accuracy: state.lastResult.accuracy,
    category: state.lastResult.category,
    difficulty: state.lastResult.difficulty,
    date: new Date().toISOString(),
  };
  state.leaderboard = state.leaderboard.concat(entry).sort((a, b) => b.score - a.score || b.accuracy - a.accuracy).slice(0, 20);
  storageSet(LEADERBOARD_KEY, state.leaderboard);
  state.savedNotice = true;
  render();
};
window.requestReset = function () { state.resetConfirm = true; render(); };
window.cancelReset = function () { state.resetConfirm = false; render(); };
window.confirmReset = function () {
  state.leaderboard = [];
  storageSet(LEADERBOARD_KEY, []);
  state.resetConfirm = false;
  render();
};

window.openAuth = function (mode) {
  state.authOpen = true;
  state.authMode = mode || "login";
  state.authError = "";
  render();
};
window.closeAuth = function () { state.authOpen = false; render(); };
window.setAuthField = function (field, value) { state[field] = value; };
window.submitAuth = async function () {
  state.authError = "";
  if (!supabase) {
    state.authError = "Layanan akun belum siap. Main sebagai tamu dulu.";
    render();
    return;
  }
  const email = (state.authEmail || "").trim();
  const password = state.authPassword || "";
  if (!email || password.length < 6) {
    state.authError = "Isi email dan kata sandi minimal 6 karakter.";
    render();
    return;
  }
  try {
    if (state.authMode === "signup") {
      const name = (state.authName || email.split("@")[0]).slice(0, 20);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (error) throw error;
      state.authError = "Cek email untuk konfirmasi jika diminta, lalu masuk.";
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    await refreshSession();
    if (state.user) {
      state.authOpen = false;
      if (state.authName) state.profile.display_name = state.authName.slice(0, 20);
    }
  } catch (err) {
    state.authError = err.message || "Gagal masuk.";
  }
  render();
};
window.continueGuest = function () {
  state.profile.is_guest = true;
  if (!state.profile.display_name || state.profile.display_name === "Tamu") {
    state.profile.display_name = "Tamu";
  }
  persistProfile();
  state.authOpen = false;
  state.view = "setup";
  render();
};
window.signOut = async function () {
  if (supabase) await supabase.auth.signOut();
  state.user = null;
  render();
};
window.buyItem = function (id) {
  const item = COLLECTIBLES.find((c) => c.id === id);
  if (!item) return;
  if ((state.profile.inventory || []).indexOf(id) >= 0) return;
  if ((state.profile.gems || 0) < item.cost) return;
  addGems(-item.cost, "buy");
  state.profile.inventory = (state.profile.inventory || []).concat([id]);
  persistProfile();
  if (supabase && state.user) {
    supabase.from("inventory").upsert({ user_id: state.user.id, item_id: id }).then(function () {});
  }
  render();
};

window.openEditor = function (id) {
  const existing = id && state.customSets.find((s) => s.id === id);
  state.editor = existing
    ? JSON.parse(JSON.stringify(existing))
    : { id: "local-" + Date.now().toString(36), title: "Set baru", description: "", questions: [], remote: false };
  if (!state.editor.questions.length) {
    state.editor.questions.push({ id: "q1", q: "", o: ["", "", "", ""], a: 0, ex: "", cat: "campuran", diff: "sedang" });
  }
  state.view = "editor";
  render();
};
window.editSetField = function (field, value) { if (state.editor) state.editor[field] = value; };
window.editQuestionField = function (idx, field, value) {
  if (!state.editor) return;
  state.editor.questions[idx][field] = value;
};
window.editOption = function (qi, oi, value) {
  state.editor.questions[qi].o[oi] = value;
};
window.addEditorQuestion = function () {
  state.editor.questions.push({ id: "q" + Date.now(), q: "", o: ["", "", "", ""], a: 0, ex: "", cat: "campuran", diff: "sedang" });
  render();
};
window.removeEditorQuestion = function (idx) {
  state.editor.questions.splice(idx, 1);
  render();
};
window.saveEditor = async function () {
  const ed = state.editor;
  if (!ed || !ed.title.trim()) return;
  ed.questions = ed.questions.filter((q) => q.q && q.o.every(Boolean));
  const idx = state.customSets.findIndex((s) => s.id === ed.id);
  if (idx >= 0) state.customSets[idx] = ed;
  else state.customSets.unshift(ed);
  persistSets();
  if (supabase && state.user) {
    const payload = { owner_id: state.user.id, title: ed.title, description: ed.description || "", is_public: !!ed.is_public };
    let setId = ed.remote ? ed.id : null;
    if (ed.remote) {
      await supabase.from("question_sets").update(payload).eq("id", ed.id);
    } else {
      const ins = await supabase.from("question_sets").insert(payload).select("id").single();
      if (ins.data) {
        setId = ins.data.id;
        ed.id = setId;
        ed.remote = true;
      }
    }
    if (setId) {
      await supabase.from("custom_questions").delete().eq("set_id", setId);
      const rows = ed.questions.map((q, i) => ({
        set_id: setId,
        prompt: q.q,
        options: q.o,
        correct_index: Number(q.a) || 0,
        explanation: q.ex || "",
        category: q.cat || "campuran",
        difficulty: q.diff || "sedang",
        sort_order: i,
      }));
      if (rows.length) await supabase.from("custom_questions").insert(rows);
    }
  }
  state.customSetId = ed.id;
  state.questionSource = "custom";
  state.view = "sets";
  render();
};

const PARTY_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function makePartyCode() {
  let c = "";
  for (let i = 0; i < 5; i++) c += PARTY_CHARS[Math.floor(Math.random() * PARTY_CHARS.length)];
  return c;
}
function partySend(msg) {
  if (!party.channel || !supabase) return;
  party.channel.send({ type: "broadcast", event: "gd", payload: msg });
}
function partyCleanupChannel() {
  clearInterval(party.clock);
  clearTimeout(party.revealTimer);
  clearInterval(party._joinTimer);
  if (party.channel && supabase) {
    try { supabase.removeChannel(party.channel); } catch (e) {}
  }
  party.channel = null;
  party.connected = false;
}
function attachPartyChannel(code) {
  if (!supabase) {
    party.error = "Supabase belum siap. Refresh halaman.";
    return Promise.resolve(null);
  }
  partyCleanupChannel();
  party.code = code;
  const ch = supabase.channel("gd-" + code, { config: { broadcast: { self: false } } });
  ch.on("broadcast", { event: "gd" }, function (ev) {
    if (ev && ev.payload) partyOnMessage(ev.payload);
  });
  party.channel = ch;
  return new Promise(function (resolve) {
    ch.subscribe(function (status) {
      if (status === "SUBSCRIBED") {
        party.connected = true;
        resolve(ch);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        party.connected = false;
        party.error = "Gagal terhubung ke ruang.";
        resolve(null);
      }
    });
  });
}
function partySnapshot() {
  return {
    type: "snap",
    code: party.code,
    players: party.players,
    phase: party.phase,
    questionNumber: party.questionNumber,
    total: party.total,
    timeLimit: party.timeLimit,
    timeLeft: party.timeLeft,
    revealed: party.revealed,
    q: party.q
      ? { text: party.q.text, cat: party.q.cat, diff: party.q.diff, options: party.q.options }
      : null,
    ex: party.revealed && party.q ? party.q.ex || "" : "",
    correctIndex: party.revealed && party.q ? party.q.correctIndex : -1,
    submissions: party.submissions,
    scores: party.scores,
    leaderboard: party.leaderboard,
    settings: party.settings,
  };
}
function partyBroadcast() {
  partySend(partySnapshot());
}
function unansweredCount() {
  return (party.players || []).filter((p) => p.id !== "host" && p.role !== "host" && !party.submissions[p.id]).length;
}
function partyReveal() {
  if (party.revealed || party.phase !== "question") return;
  party.revealed = true;
  clearInterval(party.clock);
  clearTimeout(party.revealTimer);
  (party.players || []).forEach((p) => {
    if (p.id === "host") return;
    if (!party.submissions[p.id]) party.submissions[p.id] = { optionIndex: -1, isCorrect: false, points: 0 };
    party.scores[p.id] = (party.scores[p.id] || 0) + (party.submissions[p.id].points || 0);
  });
  partyBroadcast();
  render();
}
function partyStartClock() {
  clearInterval(party.clock);
  party.clock = setInterval(function () {
    party.timeLeft -= 1;
    if (party.timeLeft <= 0) {
      party.timeLeft = 0;
      partyReveal();
    } else {
      partyBroadcast();
      const t = document.getElementById("quiz-time");
      if (t) t.textContent = party.timeLeft + "s";
    }
  }, 1000);
}
function partyBeginQuestion() {
  if (party.questionNumber >= (party.questions || []).length) {
    window.partyFinish();
    return;
  }
  const q = party.questions[party.questionNumber];
  party.q = q;
  party.revealed = false;
  party.submissions = {};
  party.timeLimit = (party.settings && party.settings.timeOverride) || q.timeLimit || 20;
  party.timeLeft = party.timeLimit;
  party.total = party.questions.length;
  party.phase = "question";
  partyBroadcast();
  render();
  partyStartClock();
}
function hostHandleJoin(msg) {
  if (msg.code && party.code && msg.code !== party.code) return;
  if (party.phase !== "lobby" && !(party.settings && party.settings.lateJoin)) {
    partySend({ type: "error", error: "Kuis sudah dimulai." });
    return;
  }
  const id = String(msg.sendId || ("s" + Date.now().toString(36))).slice(0, 40);
  if (party.players.some((p) => p.id === id)) {
    const existing = party.players.find((p) => p.id === id);
    existing.name = String(msg.name || existing.name).slice(0, 20);
  } else {
    if (party.players.filter((p) => p.id !== "host").length >= 60) {
      partySend({ type: "error", error: "Kelas penuh." });
      return;
    }
    party.players.push({ id: id, name: String(msg.name || "Murid").slice(0, 20), role: "student" });
  }
  partyBroadcast();
  render();
}
function hostHandleAnswer(msg) {
  if (party.phase !== "question" || party.revealed) return;
  if (msg.questionNumber !== party.questionNumber) return;
  const id = msg.id || msg.sendId;
  if (!party.players.some((p) => p.id === id)) return;
  if (party.submissions[id]) return;
  const opt = Number(msg.optionIndex);
  const isCorrect = opt === party.q.correctIndex;
  const base = 100 * (party.q.multiplier || 1) * ((party.settings && party.settings.pointsMultiplier) || 1);
  const timeBonus = isCorrect ? Math.round((party.timeLeft / Math.max(1, party.timeLimit)) * 40) : 0;
  party.submissions[id] = { optionIndex: opt, isCorrect: isCorrect, points: isCorrect ? Math.round(base + timeBonus) : 0 };
  partyBroadcast();
  render();
  if (party.settings && party.settings.waitForAll && unansweredCount() === 0) {
    party.revealTimer = setTimeout(partyReveal, 500);
  }
}
function hostHandleLeave(msg) {
  const id = msg.id;
  party.players = party.players.filter((p) => p.id !== id);
  delete party.scores[id];
  delete party.submissions[id];
  partyBroadcast();
  render();
}
function applySnap(s) {
  const qnChanged = party.questionNumber !== s.questionNumber;
  if (qnChanged) party._myAnswered = null;
  party._hasSnap = true;
  party.code = s.code;
  party.players = s.players || [];
  party.phase = s.phase;
  party.questionNumber = s.questionNumber;
  party.total = s.total;
  party.timeLimit = s.timeLimit;
  party.timeLeft = s.timeLeft;
  party.revealed = s.revealed;
  party.q = s.q;
  party.correctIndex = s.correctIndex;
  party.submissions = s.submissions || {};
  party.scores = s.scores || {};
  party.leaderboard = s.leaderboard || [];
  party.settings = s.settings || party.settings;
  party.ex = s.ex || "";
  if (party.role === "student" && !party.myId && s.players) {
    const me = s.players.find((p) => p.id === party.sendId);
    if (me) party.myId = me.id;
  }
  render();
}
function partyOnMessage(msg) {
  if (!msg || typeof msg !== "object") return;
  if (party.role === "host") {
    if (msg.type === "join") hostHandleJoin(msg);
    else if (msg.type === "answer") hostHandleAnswer(msg);
    else if (msg.type === "leave") hostHandleLeave(msg);
    return;
  }
  if (msg.type === "error") {
    party.error = msg.error;
    if (String(msg.error || "").indexOf("sudah dimulai") >= 0 || String(msg.error || "").indexOf("penuh") >= 0) {
      clearInterval(party._joinTimer);
    }
    render();
    return;
  }
  if (msg.type === "snap") applySnap(msg);
  if (msg.type === "hostbye") {
    partyCleanupChannel();
    party.error = "Kelas ditutup oleh guru.";
    party.role = null;
    state.view = "setup";
    render();
  }
}
function questionsForRoom() {
  const pack = currentPack();
  const count = Math.min(state.roomSettings.questionCount || 10, pack.pool.length);
  return buildSessionQuestions(pack.pool, count, state.roomSettings.shuffleQuestions).map((q) => ({
    text: q.q,
    cat: q.cat,
    diff: q.diff,
    options: q.options,
    correctIndex: q.correctIndex,
    ex: q.ex,
    timeLimit: q.timeLimit,
    multiplier: q.multiplier,
  }));
}
window.startPartyHost = async function () {
  const qs = questionsForRoom();
  if (qs.length < 1) return;
  if (!supabase) {
    party.error = "Supabase belum siap. Refresh halaman.";
    state.view = "partyHost";
    render();
    return;
  }
  party.role = "host";
  party.error = "";
  party.myName = state.profile.display_name || "Guru";
  party.questions = qs;
  party.settings = Object.assign({}, state.roomSettings);
  party.players = [{ id: "host", name: party.myName, role: "host" }];
  party.phase = "lobby";
  party.questionNumber = 0;
  party.total = qs.length;
  party.scores = {};
  party.submissions = {};
  party.leaderboard = [];
  party.q = null;
  party.revealed = false;
  const code = makePartyCode();
  state.view = "partyHost";
  render();
  const ch = await attachPartyChannel(code);
  if (!ch) {
    render();
    return;
  }
  partyBroadcast();
  render();
};
window.startPartyStudent = function () {
  partyCleanupChannel();
  party.role = "student";
  party.connected = false;
  party._hasSnap = false;
  party.error = "";
  party.studentForm.name = state.profile.display_name && state.profile.display_name !== "Tamu" ? state.profile.display_name : "";
  state.view = "partyStudent";
  render();
};
window.partyFormName = function (v) { party.studentForm.name = v; };
window.partyFormCode = function (v) { party.studentForm.code = v.toUpperCase(); };
window.partyJoinNow = async function () {
  const name = party.studentForm.name.trim();
  const code = (party.studentForm.code || "").trim().toUpperCase();
  if (!name) { party.error = "Masukkan nama kamu dulu."; render(); return; }
  if (!code) { party.error = "Masukkan kode dari guru kamu."; render(); return; }
  if (!supabase) { party.error = "Supabase belum siap. Refresh halaman."; render(); return; }
  party.myName = name;
  party.sendId = party.sendId || ("s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  party.error = "";
  render();
  const ch = await attachPartyChannel(code);
  if (!ch) { render(); return; }
  partySend({ type: "join", code: code, name: name, sendId: party.sendId });
  clearInterval(party._joinTimer);
  party._joinTimer = setInterval(function () {
    if (party.role !== "student" || party.myId || party._hasSnap) {
      clearInterval(party._joinTimer);
      return;
    }
    partySend({ type: "join", code: party.code, name: party.myName, sendId: party.sendId });
  }, 1500);
  render();
};
window.partyStartQuiz = function () {
  party.questionNumber = 0;
  party.scores = {};
  party.leaderboard = [];
  partyBeginQuestion();
};
window.partyNext = function () {
  if (!party.revealed && party.phase === "question") partyReveal();
  party.questionNumber += 1;
  partyBeginQuestion();
};
window.partyFinish = function () {
  clearInterval(party.clock);
  party.phase = "final";
  party.leaderboard = (party.players || [])
    .filter((p) => p.id !== "host")
    .map((p) => ({ id: p.id, name: p.name, score: party.scores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  partyBroadcast();
  render();
};
window.partyStudentAnswer = function (i) {
  if (party.revealed || party._myAnswered !== null) return;
  party._myAnswered = i;
  partySend({
    type: "answer",
    code: party.code,
    id: party.myId || party.sendId,
    sendId: party.sendId,
    questionNumber: party.questionNumber,
    optionIndex: i,
  });
  render();
};
window.partyCopyCode = function () {
  const txt = party.code || "";
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function () {});
};
function leaveParty() {
  if (party.role === "student" && party.myId) partySend({ type: "leave", id: party.myId, code: party.code });
  else if (party.role === "host") partySend({ type: "hostbye", code: party.code });
  partyCleanupChannel();
  party.role = null;
  party.code = null;
  party.players = [];
  party.phase = "lobby";
  party.q = null;
  party.error = "";
  party.myId = null;
  party.sendId = null;
}
window.leaveParty = leaveParty;

function diffColor(diff) {
  if (diff === "mudah") return "#3F7D58";
  if (diff === "sedang") return "#C08A2E";
  if (diff === "sulit") return "#B23A48";
  return null;
}
function difficultyArt(catKey, diffKey) {
  const color = diffColor(diffKey);
  const accent = color ? "background:" + color : "background:linear-gradient(90deg,#3F7D58,#C08A2E,#B23A48)";
  const tagColor = color || "#7C3FA0";
  return (
    '<div class="gd-hero">' +
    '<div style="position:absolute;left:0;right:0;top:0;height:5px;' + accent + '"></div>' +
    '<svg viewBox="0 0 340 80" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="' + (color || "#2F4C7A") + '" stroke-width="2" stroke-linecap="round"><circle cx="48" cy="40" r="10"/><path d="M20 64 L64 28 L108 64"/><path d="M200 58 Q240 44 280 58"/></g></svg>' +
    '<div class="gd-hero-safe">' +
    '<span class="gd-tag">' + escapeHTML(categoryLabel(catKey)) + "</span>" +
    '<span class="gd-tag" style="color:' + tagColor + '">' + escapeHTML(difficultyLabel(diffKey)) + "</span>" +
    "</div></div>"
  );
}

function render() {
  const root = document.getElementById("app");
  const vars = state.theme === "dark" ? darkVars : lightVars;
  let css = "";
  for (const k in vars) css += k + ":" + vars[k] + ";";
  root.style.cssText = css;
  root.dataset.theme = state.theme;
  document.body.style.backgroundColor = vars["--gd-bg"];
  root.innerHTML =
    '<div class="gd-wrap">' +
    (state.view !== "splash" ? topbarHTML() : "") +
    viewHTML() +
    '<div class="gd-credit">Dibuat oleh Ahsan &amp; Alfon dengan Claude Code</div>' +
    "</div>" +
    (state.settingsOpen ? settingsModalHTML() : "") +
    (state.authOpen ? authModalHTML() : "");
}

function topbarHTML() {
  return (
    '<div class="gd-topbar">' +
    '<button class="gd-icon-btn gd-focusable" onclick="goHome()" aria-label="Beranda">' + icon("home", 18) + "</button>" +
    '<div class="gd-font-display" style="font-weight:600;font-size:18px">Gameducation</div>' +
    '<div style="display:flex;gap:6px">' +
    '<button class="gd-icon-btn gd-focusable" onclick="goView(&quot;collection&quot;)" aria-label="Permata">' + icon("gem", 18) + "</button>" +
    '<button class="gd-icon-btn gd-focusable" onclick="toggleSound()" aria-label="Suara">' + icon(state.sound ? "volume2" : "volumeX", 18) + "</button>" +
    '<button class="gd-icon-btn gd-focusable" onclick="openSettings()" aria-label="Pengaturan">' + icon("settings", 18) + "</button>" +
    "</div></div>"
  );
}

function viewHTML() {
  switch (state.view) {
    case "splash": return splashHTML();
    case "setup": return setupHTML();
    case "quiz": return quizHTML();
    case "results": return resultsHTML();
    case "review": return reviewHTML();
    case "leaderboard": return leaderboardHTML();
    case "collection": return collectionHTML();
    case "sets": return setsHTML();
    case "editor": return editorHTML();
    case "partyHost": return partyHostHTML();
    case "partyStudent": return partyStudentHTML();
    default: return splashHTML();
  }
}

function splashHTML() {
  return (
    '<div class="gd-anim-in" style="min-height:72vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
    '<div class="gd-splash-pulse gd-accent-bg" style="width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px">' + icon("sparkles", 36) + "</div>" +
    '<h1 class="gd-font-display" style="font-size:clamp(32px,8vw,40px);font-weight:700;margin:0 0 8px">Gameducation</h1>' +
    '<p class="gd-text-muted" style="margin:0 0 6px">Kuis pengetahuan umum khas Nusantara</p>' +
    '<p class="gd-text-muted" style="font-size:13px;margin:0 0 22px">Main · Kumpulkan permata · Buat soal · Gabung kelas</p>' +
    '<div style="height:1px;width:160px;background:var(--gd-border);margin-bottom:22px"></div>' +
    '<button class="gd-btn-primary" onclick="goView(&quot;setup&quot;)">' + icon("play", 18) + "<span>Mulai Bermain</span></button>" +
    '<button class="gd-btn-ghost" style="margin-top:10px" onclick="openAuth(&quot;login&quot;)">' + icon("user", 16) + "<span>Masuk atau daftar</span></button>" +
    "</div>"
  );
}

function pill(active, onclick, inner, extra) {
  return '<button type="button" class="gd-pill gd-focusable' + (active ? " gd-pill-active" : "") + (extra ? " " + extra : "") + '" onclick="' + onclick + '">' + inner + "</button>";
}

function setupHTML() {
  const pack = currentPack();
  const poolSize = pack.pool.length;
  const want = state.roomSettings.questionCount || DEFAULT_QUESTION_COUNT;
  const canStart = poolSize >= MIN_QUESTIONS_TO_START || (state.questionSource === "custom" && poolSize > 0);
  const catPills =
    pill(state.category === "semua", "setCategory(&quot;semua&quot;)", icon("shuffle", 15) + "<span>Semua</span>", "gd-pill-wide") +
    CATEGORIES.map((c) => pill(state.category === c.key, "setCategory(&quot;" + c.key + "&quot;)", icon(c.icon, 15) + "<span>" + c.label + "</span>")).join("");
  const diffPills =
    pill(state.difficulty === "campuran", "setDifficulty(&quot;campuran&quot;)", "<span>Campuran</span>") +
    DIFFICULTIES.map((d) => pill(state.difficulty === d.key, "setDifficulty(&quot;" + d.key + "&quot;)", "<span>" + d.label + "</span>")).join("");
  let info;
  if (poolSize === 0) {
    info = '<div class="gd-surface" style="border-radius:16px;padding:16px;text-align:center">Belum ada soal untuk pilihan ini.</div>';
  } else if (poolSize < MIN_QUESTIONS_TO_START && state.questionSource === "bank") {
    info = '<div class="gd-accent-soft-bg" style="border-radius:12px;padding:10px 14px;font-size:13px">Hanya ' + poolSize + " soal. Butuh minimal " + MIN_QUESTIONS_TO_START + " untuk memulai.</div>";
  } else {
    info = '<p class="gd-text-muted" style="font-size:13px;margin:0">' + poolSize + " soal tersedia. Sesi memakai hingga " + Math.min(want, poolSize) + " soal.</p>";
  }
  const daily = state.profile.daily_claimed_on === todayStamp()
    ? '<span class="gd-text-muted" style="font-size:12px">Bonus harian sudah diambil</span>'
    : '<button class="gd-btn-secondary" onclick="claimDaily()">' + icon("gem", 15) + "<span>Ambil +15 permata hari ini</span></button>";

  return (
    '<div class="gd-anim-in gd-stack">' +
    '<div class="gd-surface" style="border-radius:16px;padding:14px;display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    "<div><div style=\"font-weight:700\">" + escapeHTML(state.profile.display_name || "Tamu") + "</div>" +
    '<div class="gd-text-muted" style="font-size:12px">' + icon("gem", 12) + " " + (state.profile.gems || 0) + " permata · streak " + (state.profile.streak || 0) + "</div></div>" +
    (state.user
      ? '<button class="gd-btn-ghost" onclick="signOut()">Keluar</button>'
      : '<button class="gd-btn-secondary" onclick="openAuth(&quot;login&quot;)">Masuk</button>') +
    "</div>" +
    daily +
    difficultyArt(state.category, state.difficulty) +
    '<div class="gd-surface" style="border-radius:16px;padding:16px">' +
    '<div class="gd-label">Sumber soal</div>' +
    '<div class="gd-grid-diff" style="margin-top:10px">' +
    pill(state.questionSource === "bank", "setQuestionSource(&quot;bank&quot;)", "Bank resmi") +
    pill(state.questionSource === "custom", "setQuestionSource(&quot;custom&quot;)", "Set kustom") +
    "</div>" +
    (state.questionSource === "custom"
      ? '<select class="gd-input" style="margin-top:10px" onchange="setCustomSetId(this.value)">' +
        '<option value="">Pilih set</option>' +
        state.customSets.map((s) => '<option value="' + escapeHTML(s.id) + '"' + (state.customSetId === s.id ? " selected" : "") + ">" + escapeHTML(s.title) + " (" + s.questions.length + ")</option>").join("") +
        "</select>"
      : "") +
    "</div>" +
    (state.questionSource === "bank"
      ? '<div class="gd-surface" style="border-radius:16px;padding:16px"><div class="gd-label">Kategori</div><div class="gd-grid-cat" style="margin-top:10px">' + catPills + "</div></div>" +
        '<div class="gd-surface" style="border-radius:16px;padding:16px"><div class="gd-label">Tingkat</div><div class="gd-grid-diff" style="margin-top:10px">' + diffPills + "</div></div>"
      : "") +
    '<div class="gd-surface" style="border-radius:16px;padding:16px">' +
    '<div class="gd-label">Jumlah soal</div>' +
    '<div class="gd-grid-diff" style="margin-top:10px">' +
    [5, 10, 15].map((n) => pill(state.roomSettings.questionCount === n, "setRoomSetting(&quot;questionCount&quot;," + n + ")", String(n))).join("") +
    "</div></div>" +
    info +
    '<button class="gd-btn-primary" style="width:100%" onclick="startQuiz()"' + (canStart ? "" : " disabled") + ">" + icon("play", 18) + "<span>Mulai Kuis</span></button>" +
    '<button class="gd-btn-secondary" style="width:100%" onclick="goView(&quot;leaderboard&quot;)">' + icon("award", 16) + "<span>Papan Peringkat</span></button>" +
    '<div class="gd-surface" style="border-radius:16px;padding:16px">' +
    '<div class="gd-label" style="margin-bottom:8px">Mode kelas</div>' +
    '<p class="gd-text-muted" style="font-size:13px;margin:0 0 10px">Guru membuat ruang; murid gabung dari perangkat mana pun dengan kode.</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="gd-btn-secondary" onclick="startPartyHost()">' + icon("users", 15) + "<span>Buat ruang</span></button>" +
    '<button class="gd-btn-secondary" onclick="startPartyStudent()">' + icon("logIn", 15) + "<span>Gabung</span></button>" +
    "</div>" +
    '<div class="gd-label" style="margin:14px 0 8px">Pengaturan ruang</div>' +
    '<label class="gd-text-muted" style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin:6px 0">Tunggu semua jawaban <input type="checkbox" ' + (state.roomSettings.waitForAll ? "checked" : "") + ' onchange="setRoomSetting(&quot;waitForAll&quot;,this.checked)" /></label>' +
    '<label class="gd-text-muted" style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin:6px 0">Tampilkan penjelasan <input type="checkbox" ' + (state.roomSettings.showExplanation ? "checked" : "") + ' onchange="setRoomSetting(&quot;showExplanation&quot;,this.checked)" /></label>' +
    '<label class="gd-text-muted" style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin:6px 0">Izinkan gabung terlambat <input type="checkbox" ' + (state.roomSettings.lateJoin ? "checked" : "") + ' onchange="setRoomSetting(&quot;lateJoin&quot;,this.checked)" /></label>' +
    '<label class="gd-text-muted" style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin:6px 0">Acak soal <input type="checkbox" ' + (state.roomSettings.shuffleQuestions ? "checked" : "") + ' onchange="setRoomSetting(&quot;shuffleQuestions&quot;,this.checked)" /></label>' +
    '<div class="gd-label" style="margin-top:10px">Waktu per soal</div>' +
    '<div class="gd-grid-diff" style="margin-top:8px">' +
    pill(state.roomSettings.timeOverride === 0, "setRoomSetting(&quot;timeOverride&quot;,0)", "Otomatis") +
    pill(state.roomSettings.timeOverride === 15, "setRoomSetting(&quot;timeOverride&quot;,15)", "15 dtk") +
    pill(state.roomSettings.timeOverride === 25, "setRoomSetting(&quot;timeOverride&quot;,25)", "25 dtk") +
    pill(state.roomSettings.timeOverride === 40, "setRoomSetting(&quot;timeOverride&quot;,40)", "40 dtk") +
    "</div></div>" +
    '<button class="gd-btn-secondary" style="width:100%" onclick="goView(&quot;sets&quot;)">' + icon("plus", 16) + "<span>Buat / kelola set soal</span></button>" +
    "</div>"
  );
}

function quizHTML() {
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  const progressPct = Math.round((quizTimeLeft / quizTimeLimit) * 100);
  const timeColor = progressPct > 50 ? "var(--gd-accent)" : progressPct > 20 ? "var(--gd-warning)" : "var(--gd-error)";
  const options = q.options.map((opt, i) => {
    let cls = "gd-option gd-focusable";
    let trailing = "";
    if (quizAnswered) {
      if (i === q.correctIndex) { cls += " gd-option-correct"; trailing = icon("check", 18); }
      else if (i === quizSelected) { cls += " gd-option-wrong"; trailing = icon("x", 18); }
    }
    return '<button type="button" class="' + cls + '"' + (quizAnswered ? " disabled" : "") + ' onclick="onOptionClick(' + i + ')"><span class="gd-option-letter">' + String.fromCharCode(65 + i) + '</span><span style="flex:1;text-align:left">' + escapeHTML(opt) + "</span>" + trailing + "</button>";
  }).join("");
  return (
    '<div class="gd-anim-in">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span class="gd-text-muted" style="font-size:13px">Soal ' + (quiz.index + 1) + "/" + total + '</span><span style="font-size:13px;display:flex;align-items:center;gap:4px">' + icon("clock", 14) + '<span id="quiz-time">' + quizTimeLeft + "s</span></span></div>" +
    '<div style="height:6px;border-radius:6px;background:var(--gd-border);overflow:hidden;margin-bottom:12px"><div id="quiz-progress" style="height:100%;width:' + progressPct + "%;background:" + timeColor + '"></div></div>' +
    difficultyArt(q.cat, q.diff) +
    '<h2 style="font-size:19px;font-weight:600;line-height:1.4;margin:16px 0">' + escapeHTML(q.q) + "</h2>" +
    '<div class="gd-stack">' + options + "</div>" +
    (quizAnswered && q.ex ? '<div class="gd-surface" style="border-radius:12px;padding:12px;margin-top:12px;font-size:13px"><strong>Fakta singkat</strong><div class="gd-text-muted">' + escapeHTML(q.ex) + "</div></div>" : "") +
    "</div>"
  );
}

function resultsHTML() {
  const r = state.lastResult;
  const saveForm = state.savedNotice
    ? '<div class="gd-accent-soft-bg" style="border-radius:12px;padding:10px 14px;font-size:13px;text-align:center">Skor tersimpan di papan peringkat.</div>'
    : '<div class="gd-surface" style="border-radius:16px;padding:16px"><div class="gd-label" style="margin-bottom:8px">Simpan ke papan peringkat</div><div style="display:flex;gap:8px"><input class="gd-input" placeholder="Nama pemain" value="' + escapeHTML(state.nameInput) + '" maxlength="20" oninput="setNameInput(this.value)" /><button class="gd-btn-primary" onclick="saveScore()">Simpan</button></div></div>';
  return (
    '<div class="gd-anim-in gd-stack">' +
    difficultyArt(r.category, r.difficulty) +
    '<div class="gd-surface" style="border-radius:20px;padding:24px 20px;text-align:center">' +
    icon("award", 32, "gd-accent") +
    '<p class="gd-text-muted" style="margin:8px 0 0">Skor akhir</p>' +
    '<div class="gd-font-display" style="font-size:44px;font-weight:700">' + r.score + "</div>" +
    '<div style="display:flex;justify-content:center;gap:24px;font-size:13px">' +
    "<div>Akurasi<br><b>" + r.accuracy + "%</b></div><div>Benar<br><b>" + r.correctCount + "/" + r.total + "</b></div><div>Waktu<br><b>" + formatSeconds(r.timeSeconds) + "</b></div></div>" +
    '<div style="margin-top:12px;font-weight:700;color:var(--gd-accent)">' + icon("gem", 16) + " +" + (r.gemsEarned || 0) + " permata</div>" +
    "</div>" + saveForm +
    '<button class="gd-btn-secondary" onclick="goView(&quot;review&quot;)">' + icon("listChecks", 16) + "<span>Ulasan jawaban</span></button>" +
    '<button class="gd-btn-primary" onclick="goView(&quot;setup&quot;)">' + icon("rotateCcw", 16) + "<span>Main lagi</span></button>" +
    '<button class="gd-btn-ghost" onclick="goHome()">' + icon("home", 16) + "<span>Menu</span></button>" +
    "</div>"
  );
}

function reviewHTML() {
  const items = state.lastResult.answers.map((a, i) => {
    const opts = a.options.map((opt, idx) => {
      let cls = "gd-review-option";
      if (idx === a.correctIndex) cls += " gd-review-correct";
      else if (idx === a.selectedIndex) cls += " gd-review-wrong";
      return '<div class="' + cls + '"><span class="gd-option-letter">' + String.fromCharCode(65 + idx) + "</span><span style=\"flex:1\">" + escapeHTML(opt) + "</span></div>";
    }).join("");
    return '<div class="gd-surface" style="border-radius:14px;padding:14px"><div style="display:flex;justify-content:space-between"><b>Soal ' + (i + 1) + '</b><span class="' + (a.isCorrect ? "gd-badge-success" : "gd-badge-error") + '">' + (a.isCorrect ? "Benar" : "Salah") + "</span></div><p>" + escapeHTML(a.question) + "</p>" + opts + (a.explanation ? '<p class="gd-text-muted" style="font-size:12px">' + escapeHTML(a.explanation) + "</p>" : "") + "</div>";
  }).join("");
  return '<div class="gd-anim-in gd-stack"><button class="gd-btn-ghost" onclick="goView(&quot;results&quot;)">' + icon("arrowLeft", 16) + "<span>Kembali</span></button><h2 class=\"gd-font-display\" style=\"margin:0\">Ulasan</h2>" + items + "</div>";
}

function leaderboardHTML() {
  const rows = state.leaderboard.map((e, i) => (
    '<div class="gd-surface" style="border-radius:12px;padding:10px 14px;display:flex;gap:12px;align-items:center"><div class="' + (i < 3 ? "gd-accent-bg" : "") + '" style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">' + (i + 1) + "</div><div style=\"flex:1\"><b>" + escapeHTML(e.name) + "</b><div class=\"gd-text-muted\" style=\"font-size:11px\">" + escapeHTML(categoryLabel(e.category)) + "</div></div><div><b>" + e.score + "</b></div></div>"
  )).join("");
  return '<div class="gd-anim-in gd-stack"><button class="gd-btn-ghost" onclick="goHome()">' + icon("arrowLeft", 16) + "<span>Kembali</span></button><h2 class=\"gd-font-display\" style=\"margin:0\">Papan Peringkat</h2>" + (rows || '<div class="gd-surface" style="padding:24px;text-align:center;border-radius:16px">Belum ada skor.</div>') + "</div>";
}

function collectionHTML() {
  const cards = COLLECTIBLES.map((c) => {
    const owned = (state.profile.inventory || []).indexOf(c.id) >= 0;
    return '<div class="gd-surface" style="border-radius:14px;padding:14px;display:flex;justify-content:space-between;gap:10px;align-items:center"><div><b>' + escapeHTML(c.name) + '</b><div class="gd-text-muted" style="font-size:12px">' + escapeHTML(c.blurb) + "</div></div>" +
      (owned ? '<span class="gd-badge-success">Punya</span>' : '<button class="gd-btn-secondary" onclick="buyItem(&quot;' + c.id + '&quot;)" ' + ((state.profile.gems || 0) < c.cost ? "disabled" : "") + ">" + c.cost + " 💎</button>") +
      "</div>";
  }).join("");
  return '<div class="gd-anim-in gd-stack"><button class="gd-btn-ghost" onclick="goHome()">' + icon("arrowLeft", 16) + "<span>Kembali</span></button><h2 class=\"gd-font-display\" style=\"margin:0\">Koleksi</h2><p class=\"gd-text-muted\" style=\"margin:0\">Kamu punya " + (state.profile.gems || 0) + " permata. Main kuis, kumpulkan, tukar lencana.</p>" + cards + "</div>";
}

function setsHTML() {
  const list = state.customSets.map((s) => (
    '<div class="gd-surface" style="border-radius:14px;padding:14px;display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>' + escapeHTML(s.title) + '</b><div class="gd-text-muted" style="font-size:12px">' + s.questions.length + " soal</div></div><button class=\"gd-btn-secondary\" onclick=\"openEditor(&quot;" + escapeHTML(s.id) + "&quot;)\">Ubah</button></div>"
  )).join("");
  return '<div class="gd-anim-in gd-stack"><button class="gd-btn-ghost" onclick="goHome()">' + icon("arrowLeft", 16) + "<span>Kembali</span></button><h2 class=\"gd-font-display\" style=\"margin:0\">Set soal</h2><button class=\"gd-btn-primary\" onclick=\"openEditor()\">" + icon("plus", 16) + "<span>Set baru</span></button>" + (list || '<p class="gd-text-muted">Belum ada set. Buat seperti kuis kustom di aplikasi kelas.</p>') + "</div>";
}

function editorHTML() {
  const ed = state.editor;
  const qs = ed.questions.map((q, i) => {
    const opts = [0, 1, 2, 3].map((oi) => {
      return (
        '<label style="display:flex;gap:8px;align-items:center;margin-top:6px">' +
        '<input type="radio" name="ans' + i + '" ' + (Number(q.a) === oi ? "checked" : "") +
        " onchange=\"editQuestionField(" + i + ",'a'," + oi + ')"/>' +
        '<input class="gd-input" value="' + escapeHTML(q.o[oi] || "") +
        '" oninput="editOption(' + i + "," + oi + ',this.value)"/>' +
        "</label>"
      );
    }).join("");
    return (
      '<div class="gd-surface" style="border-radius:14px;padding:14px">' +
      '<div class="gd-label">Soal ' + (i + 1) + "</div>" +
      '<textarea class="gd-textarea" oninput="editQuestionField(' + i + ",'q',this.value)\">" + escapeHTML(q.q) + "</textarea>" +
      opts +
      '<button class="gd-btn-ghost" onclick="removeEditorQuestion(' + i + ')">Hapus soal</button></div>'
    );
  }).join("");
  return (
    '<div class="gd-anim-in gd-stack">' +
    '<button class="gd-btn-ghost" onclick="goView(\'sets\')">' + icon("arrowLeft", 16) + "<span>Batal</span></button>" +
    '<input class="gd-input" value="' + escapeHTML(ed.title) + "\" oninput=\"editSetField('title',this.value)\" />" +
    '<div class="gd-stack">' + qs + "</div>" +
    '<button class="gd-btn-secondary" onclick="addEditorQuestion()">Tambah soal</button>' +
    '<button class="gd-btn-primary" onclick="saveEditor()">Simpan set</button></div>'
  );
}

function partyChip(name, answered, isTeacher) {
  return '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--gd-border);font-size:13px">' + (isTeacher ? icon("award", 13) : answered ? icon("check", 13) : icon("clock", 13)) + escapeHTML(name) + "</div>";
}

function partyHostHTML() {
  const s = party;
  const header = '<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="gd-font-display" style="margin:0">Mode guru</h2><button class="gd-btn-ghost" onclick="leaveParty();goHome()">Tutup</button></div>';
  if (s.phase === "question" && s.q) {
    const students = (s.players || []).filter((p) => p.id !== "host" && p.role !== "host");
    const answered = students.filter((p) => s.submissions[p.id]).length;
    const pct = Math.round((s.timeLeft / Math.max(1, s.timeLimit)) * 100);
    return (
      '<div class="gd-anim-in gd-stack">' + header +
      '<div style="display:flex;justify-content:space-between"><span class="gd-text-muted">Soal ' + (s.questionNumber + 1) + "/" + s.total + '</span><span id="quiz-time">' + s.timeLeft + "s</span></div>" +
      '<div style="height:6px;border-radius:6px;background:var(--gd-border);overflow:hidden"><div style="height:100%;width:' + pct + '%;background:var(--gd-accent)"></div></div>' +
      '<h2 style="font-size:18px">' + escapeHTML(s.q.text) + "</h2>" +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + students.map((p) => partyChip(p.name, !!s.submissions[p.id], false)).join("") + "</div>" +
      (s.revealed
        ? '<div class="gd-surface" style="border-radius:14px;padding:14px">Kunci: ' + String.fromCharCode(65 + s.correctIndex) + ". " + escapeHTML(s.q.options[s.correctIndex]) +
          (s.questionNumber + 1 >= s.total
            ? '<button class="gd-btn-primary" style="width:100%;margin-top:10px" onclick="partyFinish()">Peringkat akhir</button>'
            : '<button class="gd-btn-primary" style="width:100%;margin-top:10px" onclick="partyNext()">Soal berikutnya</button>') +
          "</div>"
        : '<div class="gd-accent-soft-bg" style="border-radius:12px;padding:10px">Menunggu jawaban (' + answered + "/" + students.length + ")</div>") +
      "</div>"
    );
  }
  if (s.phase === "final") {
    const rows = (s.leaderboard || []).map((e, i) => '<div class="gd-surface" style="border-radius:12px;padding:10px 14px;display:flex;justify-content:space-between"><span>' + (i + 1) + ". " + escapeHTML(e.name) + "</span><b>" + e.score + "</b></div>").join("");
    return '<div class="gd-anim-in gd-stack">' + header + "<h3>Peringkat akhir</h3>" + rows + '<button class="gd-btn-primary" onclick="leaveParty();goHome()">Selesai</button></div>';
  }
  return (
    '<div class="gd-anim-in gd-stack">' + header +
    '<div class="gd-surface" style="border-radius:16px;padding:16px;text-align:center"><div class="gd-label">Kode ruang</div><div class="gd-font-display" style="font-size:34px;letter-spacing:8px;color:var(--gd-accent)">' + escapeHTML(s.code || "…") + '</div><button class="gd-btn-secondary" onclick="partyCopyCode()">Salin kode</button></div>' +
    '<div class="gd-surface" style="border-radius:16px;padding:16px"><div class="gd-label">Peserta</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">' + (s.players || []).map((p) => partyChip(p.name, false, p.id === "host")).join("") + "</div></div>" +
    '<button class="gd-btn-primary" onclick="partyStartQuiz()">Mulai kuis</button>' +
    (s.error ? '<div class="gd-accent-soft-bg" style="padding:10px;border-radius:12px">' + escapeHTML(s.error) + "</div>" : "") +
    "</div>"
  );
}

function partyStudentHTML() {
  if (!party._hasSnap) {
    return (
      '<div class="gd-anim-in gd-stack"><button class="gd-btn-ghost" onclick="leaveParty();goHome()">' + icon("arrowLeft", 16) + "<span>Kembali</span></button><h2 class=\"gd-font-display\" style=\"margin:0\">Mode murid</h2>" +
      '<input class="gd-input" placeholder="Nama kamu" value="' + escapeHTML(party.studentForm.name) + '" oninput="partyFormName(this.value)" />' +
      '<input class="gd-input" placeholder="KODE" maxlength="5" value="' + escapeHTML(party.studentForm.code) + '" oninput="partyFormCode(this.value)" style="text-transform:uppercase;letter-spacing:4px" />' +
      (party.error ? '<div class="gd-accent-soft-bg" style="padding:10px;border-radius:12px">' + escapeHTML(party.error) + "</div>" : "") +
      '<button class="gd-btn-primary" onclick="partyJoinNow()">Gabung</button></div>'
    );
  }
  if (party.phase === "question" && party.q) {
    const my = party.submissions[party.myId];
    const options = party.q.options.map((opt, i) => {
      let cls = "gd-option";
      if (party.revealed) {
        if (i === party.correctIndex) cls += " gd-option-correct";
        else if (my && i === my.optionIndex) cls += " gd-option-wrong";
      } else if (party._myAnswered === i) cls += " gd-option-picked";
      const dis = party.revealed || party._myAnswered !== null ? " disabled" : "";
      return '<button class="' + cls + '"' + dis + ' onclick="partyStudentAnswer(' + i + ')"><span class="gd-option-letter">' + String.fromCharCode(65 + i) + "</span>" + escapeHTML(opt) + "</button>";
    }).join("");
    return '<div class="gd-anim-in gd-stack"><div style="display:flex;justify-content:space-between"><b>' + escapeHTML(party.myName) + "</b><button class=\"gd-btn-ghost\" onclick=\"leaveParty();goHome()\">Keluar</button></div><div class=\"gd-text-muted\">Soal " + (party.questionNumber + 1) + "/" + party.total + " · " + party.timeLeft + "s</div><h2 style=\"font-size:18px\">" + escapeHTML(party.q.text) + "</h2>" + options + "</div>";
  }
  if (party.phase === "final") {
    const me = (party.leaderboard || []).find((e) => e.id === party.myId);
    return '<div class="gd-anim-in gd-stack"><h2>Peringkat akhir</h2><div class="gd-accent-bg" style="border-radius:14px;padding:14px">Skor kamu: <b>' + ((me && me.score) || 0) + "</b></div>" + (party.leaderboard || []).map((e, i) => "<div>" + (i + 1) + ". " + escapeHTML(e.name) + " — " + e.score + "</div>").join("") + '<button class="gd-btn-primary" onclick="leaveParty();goHome()">Selesai</button></div>';
  }
  return '<div class="gd-anim-in gd-stack"><div style="display:flex;justify-content:space-between"><h2 class="gd-font-display" style="margin:0">Lobby</h2><button class="gd-btn-ghost" onclick="leaveParty();goHome()">Keluar</button></div><p>Kode <b>' + escapeHTML(party.code || "") + "</b>. Menunggu guru memulai.</p><div style=\"display:flex;flex-wrap:wrap;gap:8px\">" + (party.players || []).map((p) => partyChip(p.name, false, p.id === "host")).join("") + "</div></div>";
}

function settingsModalHTML() {
  return (
    '<div class="gd-modal-back" onclick="if(event.target===this)closeSettings()"><div class="gd-modal gd-stack">' +
    '<div style="display:flex;justify-content:space-between;align-items:center"><h3 class="gd-font-display" style="margin:0">Pengaturan</h3><button class="gd-icon-btn" onclick="closeSettings()">' + icon("x", 16) + "</button></div>" +
    '<div class="gd-surface" style="border-radius:14px;padding:14px;display:flex;justify-content:space-between;align-items:center"><span>Suara</span><button class="gd-btn-secondary" onclick="toggleSound()">' + (state.sound ? "Nyala" : "Mati") + "</button></div>" +
    '<div class="gd-surface" style="border-radius:14px;padding:14px;display:flex;justify-content:space-between;align-items:center"><span>Mode gelap</span><button class="gd-btn-secondary" onclick="toggleTheme()">' + (state.theme === "dark" ? "Gelap" : "Terang") + "</button></div>" +
    (state.resetConfirm
      ? '<div style="display:flex;gap:8px"><button class="gd-btn-danger" onclick="confirmReset()">Ya, hapus</button><button class="gd-btn-secondary" onclick="cancelReset()">Batal</button></div>'
      : '<button class="gd-btn-danger-outline" onclick="requestReset()">Reset papan peringkat</button>') +
    '<p class="gd-text-muted" style="font-size:12px;margin:0">Menutup pengaturan tidak mengeluarkanmu dari kuis atau ruang kelas.</p>' +
    "</div></div>"
  );
}

function authModalHTML() {
  return (
    '<div class="gd-modal-back" onclick="if(event.target===this)closeAuth()"><div class="gd-modal gd-stack">' +
    '<div style="display:flex;justify-content:space-between"><h3 class="gd-font-display" style="margin:0">' + (state.authMode === "signup" ? "Daftar" : "Masuk") + '</h3><button class="gd-icon-btn" onclick="closeAuth()">' + icon("x", 16) + "</button></div>" +
    (state.authMode === "signup" ? '<input class="gd-input" placeholder="Nama tampilan" oninput="setAuthField(&quot;authName&quot;,this.value)" />' : "") +
    '<input class="gd-input" type="email" placeholder="Email" oninput="setAuthField(&quot;authEmail&quot;,this.value)" />' +
    '<input class="gd-input" type="password" placeholder="Kata sandi" oninput="setAuthField(&quot;authPassword&quot;,this.value)" />' +
    (state.authError ? '<div class="gd-accent-soft-bg" style="padding:10px;border-radius:12px;font-size:13px">' + escapeHTML(state.authError) + "</div>" : "") +
    '<button class="gd-btn-primary" onclick="submitAuth()">' + (state.authMode === "signup" ? "Buat akun" : "Masuk") + "</button>" +
    '<button class="gd-btn-ghost" onclick="openAuth(&quot;' + (state.authMode === "signup" ? "login" : "signup") + "&quot;)\">" + (state.authMode === "signup" ? "Sudah punya akun?" : "Belum punya akun? Daftar") + "</button>" +
    '<button class="gd-btn-secondary" onclick="continueGuest()">Lanjut sebagai tamu</button>' +
    "</div></div>"
  );
}

document.addEventListener("DOMContentLoaded", async function () {
  initSupabase();
  document.body.style.backgroundColor = state.theme === "dark" ? "#12151C" : "#F6F1E7";
  render();
  if (supabase) {
    await refreshSession();
    supabase.auth.onAuthStateChange(function () { refreshSession().then(render); });
    render();
  }
});
window.addEventListener("beforeunload", function () {
  try {
    if (party.role === "student" && party.myId) partySend({ type: "leave", id: party.myId, code: party.code });
    else if (party.role === "host") partySend({ type: "hostbye", code: party.code });
  } catch (e) {}
});
