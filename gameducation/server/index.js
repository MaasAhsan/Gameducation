"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://nrrizdeubcsrvbrfqplm.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_fKltKlxEcJZCzVtPdvxP3Q_5jdzTjBH";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const rooms = new Map();

function makeCode() {
  let code = "";
  for (let i = 0; i < 5; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return rooms.has(code) ? makeCode() : code;
}

function send(ws, obj) {
  if (ws && ws.readyState === 1) {
    try { ws.send(JSON.stringify(obj)); } catch (_) {}
  }
}

function broadcast(room, obj) {
  const data = JSON.stringify(obj);
  for (const client of room.clients) {
    if (client.ws && client.ws.readyState === 1) {
      try { client.ws.send(data); } catch (_) {}
    }
  }
}

function publicPlayers(room) {
  return room.players.map((p) => ({ id: p.id, name: p.name, role: p.role }));
}

function snapshot(room) {
  const revealed = !!room.revealed;
  const q = room.q
    ? {
        text: room.q.text,
        cat: room.q.cat,
        diff: room.q.diff,
        options: room.q.options,
      }
    : null;
  return {
    type: "snap",
    code: room.code,
    players: publicPlayers(room),
    phase: room.phase,
    questionNumber: room.questionNumber,
    total: room.total,
    timeLimit: room.timeLimit,
    timeLeft: room.timeLeft,
    revealed,
    q,
    ex: revealed && room.q ? room.q.ex || "" : "",
    correctIndex: revealed && room.q ? room.q.correctIndex : -1,
    submissions: room.submissions,
    scores: room.scores,
    leaderboard: room.leaderboard,
    settings: room.settings,
    hostName: room.hostName,
  };
}

function clearRoomTimers(room) {
  if (room.clock) clearInterval(room.clock);
  if (room.revealTimer) clearTimeout(room.revealTimer);
  room.clock = null;
  room.revealTimer = null;
}

function destroyRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  clearRoomTimers(room);
  broadcast(room, { type: "hostbye", code });
  rooms.delete(code);
}

function unansweredCount(room) {
  return room.players.filter((p) => p.role === "student" && !room.submissions[p.id]).length;
}

function reveal(room) {
  if (room.revealed || room.phase !== "question") return;
  room.revealed = true;
  clearRoomTimers(room);
  for (const p of room.players) {
    if (p.role !== "student") continue;
    if (!room.submissions[p.id]) {
      room.submissions[p.id] = { optionIndex: -1, isCorrect: false, points: 0 };
    }
    const pts = room.submissions[p.id].points || 0;
    room.scores[p.id] = (room.scores[p.id] || 0) + pts;
  }
  broadcast(room, snapshot(room));
}

function startClock(room) {
  clearRoomTimers(room);
  room.clock = setInterval(() => {
    room.timeLeft -= 1;
    if (room.timeLeft <= 0) {
      room.timeLeft = 0;
      reveal(room);
    } else {
      broadcast(room, snapshot(room));
    }
  }, 1000);
}

function startQuestion(room) {
  const qi = room.questionNumber;
  if (qi >= room.questions.length) {
    finishRoom(room);
    return;
  }
  const q = room.questions[qi];
  room.q = q;
  room.revealed = false;
  room.submissions = {};
  room.timeLimit = room.settings.timeOverride || q.timeLimit || 20;
  room.timeLeft = room.timeLimit;
  room.total = room.questions.length;
  room.phase = "question";
  broadcast(room, snapshot(room));
  startClock(room);
}

function finishRoom(room) {
  clearRoomTimers(room);
  room.phase = "final";
  room.leaderboard = room.players
    .filter((p) => p.role === "student")
    .map((p) => ({ id: p.id, name: p.name, score: room.scores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  broadcast(room, snapshot(room));
}

function handleMessage(ws, raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch (_) { return; }
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "host_create") {
    const code = makeCode();
    const settings = Object.assign({
      questionCount: 10,
      timeOverride: 0,
      shuffleQuestions: true,
      waitForAll: true,
      showExplanation: true,
      lateJoin: false,
      pointsMultiplier: 1,
    }, msg.settings || {});
    const questions = Array.isArray(msg.questions) ? msg.questions : [];
    const room = {
      code,
      settings,
      questions,
      phase: "lobby",
      questionNumber: 0,
      total: questions.length,
      timeLimit: 0,
      timeLeft: 0,
      revealed: false,
      q: null,
      submissions: {},
      scores: {},
      leaderboard: [],
      hostName: String(msg.hostName || "Guru").slice(0, 24),
      players: [{ id: "host", name: String(msg.hostName || "Guru").slice(0, 24), role: "host", ws }],
      clients: new Set(),
      clock: null,
      revealTimer: null,
    };
    ws.roomCode = code;
    ws.playerId = "host";
    ws.role = "host";
    room.clients.add({ ws, id: "host" });
    rooms.set(code, room);
    send(ws, snapshot(room));
    return;
  }

  const room = rooms.get(msg.code || ws.roomCode);
  if (!room) {
    if (msg.type === "join") send(ws, { type: "error", error: "Kode party tidak ditemukan." });
    return;
  }

  if (msg.type === "join") {
    if (room.phase !== "lobby" && !room.settings.lateJoin) {
      send(ws, { type: "error", error: "Kuis sudah dimulai." });
      return;
    }
    const id = String(msg.sendId || ("s" + Date.now().toString(36))).slice(0, 40);
    if (room.players.some((p) => p.id === id)) {
      const existing = room.players.find((p) => p.id === id);
      existing.ws = ws;
      existing.name = String(msg.name || existing.name).slice(0, 20);
    } else {
      if (room.players.filter((p) => p.role === "student").length >= 60) {
        send(ws, { type: "error", error: "Kelas penuh." });
        return;
      }
      room.players.push({
        id,
        name: String(msg.name || "Murid").slice(0, 20),
        role: "student",
        ws,
      });
    }
    ws.roomCode = room.code;
    ws.playerId = id;
    ws.role = "student";
    room.clients.add({ ws, id });
    broadcast(room, snapshot(room));
    return;
  }

  if (msg.type === "host_start" && ws.role === "host") {
    if (!room.questions.length) {
      send(ws, { type: "error", error: "Tidak ada soal." });
      return;
    }
    room.questionNumber = 0;
    room.scores = {};
    room.leaderboard = [];
    startQuestion(room);
    return;
  }

  if (msg.type === "host_next" && ws.role === "host") {
    if (!room.revealed && room.phase === "question") reveal(room);
    room.questionNumber += 1;
    startQuestion(room);
    return;
  }

  if (msg.type === "host_finish" && ws.role === "host") {
    finishRoom(room);
    return;
  }

  if (msg.type === "host_update_settings" && ws.role === "host" && room.phase === "lobby") {
    room.settings = Object.assign(room.settings, msg.settings || {});
    if (Array.isArray(msg.questions)) room.questions = msg.questions;
    room.total = room.questions.length;
    broadcast(room, snapshot(room));
    return;
  }

  if (msg.type === "answer" && ws.role === "student") {
    if (room.phase !== "question" || room.revealed) return;
    if (msg.questionNumber !== room.questionNumber) return;
    const id = ws.playerId;
    if (!room.players.some((p) => p.id === id)) return;
    if (room.submissions[id]) return;
    const opt = Number(msg.optionIndex);
    const isCorrect = opt === room.q.correctIndex;
    const base = 100 * (room.q.multiplier || 1) * (room.settings.pointsMultiplier || 1);
    const timeBonus = isCorrect ? Math.round((room.timeLeft / Math.max(1, room.timeLimit)) * 40) : 0;
    const points = isCorrect ? Math.round(base + timeBonus) : 0;
    room.submissions[id] = { optionIndex: opt, isCorrect, points };
    broadcast(room, snapshot(room));
    if (room.settings.waitForAll && unansweredCount(room) === 0) {
      room.revealTimer = setTimeout(() => reveal(room), 500);
    }
    return;
  }

  if (msg.type === "leave") {
    room.players = room.players.filter((p) => p.id !== (msg.id || ws.playerId));
    delete room.scores[msg.id || ws.playerId];
    delete room.submissions[msg.id || ws.playerId];
    if (ws.role === "host") destroyRoom(room.code);
    else broadcast(room, snapshot(room));
    return;
  }

  if (msg.type === "hostbye" && ws.role === "host") {
    destroyRoom(room.code);
  }
}

function serveFile(req, res) {
  if (req.url === "/config.js") {
    const body = `window.GD_CONFIG=${JSON.stringify({
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
    })};`;
    res.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(body);
    return;
  }

  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safe);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Tidak ditemukan");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  serveFile(req, res);
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("message", (raw) => handleMessage(ws, raw.toString()));
  ws.on("close", () => {
    const room = rooms.get(ws.roomCode);
    if (!room) return;
    if (ws.role === "host") {
      destroyRoom(room.code);
      return;
    }
    room.players = room.players.filter((p) => p.id !== ws.playerId);
    delete room.scores[ws.playerId];
    delete room.submissions[ws.playerId];
    broadcast(room, snapshot(room));
  });
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

server.listen(PORT, "0.0.0.0", () => {
  console.log("Gameducation listening on " + PORT);
});

process.on("SIGTERM", () => {
  clearInterval(heartbeat);
  server.close();
  process.exit(0);
});
