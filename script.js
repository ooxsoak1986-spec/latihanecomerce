/* ================= ELEMENT ================= */
const box = document.getElementById("box");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const result = document.getElementById("result");
const leaderboardEl = document.getElementById("leaderboard");

const coinsEl = document.getElementById("coins");
const shopEl = document.getElementById("shop");
const skinsEl = document.getElementById("skins");
const missionsEl = document.getElementById("missions");

const clickSound = document.getElementById("clickSound");
const boomSound = document.getElementById("boomSound");
const bgm = document.getElementById("bgm");

/* ================= STATE ================= */
let score = 0;
let time = 20;
let combo = 0;
let gameRunning = false;

let difficulty = "normal";

/* ================= DIFFICULTY ================= */
const difficultySettings = {
  easy:   { time: 25, speed: 1200, size: 70 },
  normal: { time: 20, speed: 900,  size: 60 },
  hard:   { time: 15, speed: 600,  size: 50 },
  insane: { time: 10, speed: 350,  size: 40 }
};

/* ================= STORAGE ================= */
let coins = parseInt(localStorage.getItem("coins")) || 0;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let ownedSkins = JSON.parse(localStorage.getItem("ownedSkins")) || ["default"];
let currentSkin = localStorage.getItem("currentSkin") || "default";

let settings = JSON.parse(localStorage.getItem("settings")) || {
  sound: true,
  music: true,
  effects: true,
  volume: 0.5
};

let missions = JSON.parse(localStorage.getItem("missions")) || [
  { id: 1, text: "Klik 20 kali", goal: 20, reward: 20, progress: 0, done: false },
  { id: 2, text: "Skor 50", goal: 50, reward: 50, progress: 0, done: false },
  { id: 3, text: "Main 3 kali", goal: 3, reward: 30, progress: 0, done: false }
];

/* ================= UI INIT ================= */
coinsEl.innerText = coins;

/* ================= LEADERBOARD ================= */
function updateLeaderboard() {
  leaderboardEl.innerHTML = "";
  leaderboard.forEach((p, i) => {
    let li = document.createElement("li");
    li.innerText = `${i+1}. ${p.name} - ${p.score}`;
    leaderboardEl.appendChild(li);
  });
}
updateLeaderboard();

/* ================= SKINS ================= */
const skins = [
  { id: "default", name: "Default", color: "cyan", price: 0 },
  { id: "fire", name: "Fire", color: "orange", price: 50 },
  { id: "neon", name: "Neon", color: "lime", price: 100 },
  { id: "galaxy", name: "Galaxy", color: "purple", price: 150 }
];

function applySkin() {
  let skin = skins.find(s => s.id === currentSkin);
  if (skin) box.style.background = skin.color;
}
applySkin();

function renderSkins() {
  skinsEl.innerHTML = "";
  skins.forEach(skin => {
    let div = document.createElement("div");
    div.className = "skin";

    let owned = ownedSkins.includes(skin.id);
    div.innerText = `${skin.name} - ${skin.price}`;

    div.onclick = () => {
      if (owned) {
        currentSkin = skin.id;
      } else if (coins >= skin.price) {
        coins -= skin.price;
        ownedSkins.push(skin.id);
      }
      localStorage.setItem("coins", coins);
      localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
      localStorage.setItem("currentSkin", currentSkin);

      coinsEl.innerText = coins;
      applySkin();
      renderSkins();
    };

    skinsEl.appendChild(div);
  });
}
renderSkins();

function toggleShop() {
  shopEl.classList.toggle("hidden");
}

/* ================= MISSIONS ================= */
function renderMissions() {
  missionsEl.innerHTML = "";
  missions.forEach(m => {
    let li = document.createElement("li");
    li.innerText = `${m.text} (${m.progress}/${m.goal}) 🎁${m.reward}`;
    if (m.done) li.style.color = "lime";
    missionsEl.appendChild(li);
  });
  localStorage.setItem("missions", JSON.stringify(missions));
}
renderMissions();

function updateMissions(type, value) {
  missions.forEach(m => {
    if (m.done) return;

    if (m.id === 1 && type === "click") m.progress++;
    if (m.id === 2 && type === "score") m.progress = value;
    if (m.id === 3 && type === "play") m.progress++;

    if (m.progress >= m.goal) {
      m.done = true;
      coins += m.reward;
    }
  });

  coinsEl.innerText = coins;
  localStorage.setItem("coins", coins);
  renderMissions();
}

/* ================= MOVE BOX ================= */
function moveBox() {
  let area = document.getElementById("gameArea");

  let setting = difficultySettings[difficulty];
  let size = setting.size - Math.floor(score / 10);
  if (size < 25) size = 25;

  box.style.width = size + "px";
  box.style.height = size + "px";

  let x = Math.random() * (area.clientWidth - size);
  let y = Math.random() * (area.clientHeight - size);

  box.style.left = x + "px";
  box.style.top = y + "px";
}

/* ================= CLICK ================= */
box.addEventListener("click", (e) => {
  if (!gameRunning) return;

  combo++;
  let points = 1 + Math.floor(combo / 5);
  score += points;

  scoreEl.innerText = score;

  updateMissions("click");
  updateMissions("score", score);

  coins++;
  coinsEl.innerText = coins;
  localStorage.setItem("coins", coins);

  if (settings.sound) {
    clickSound.play();
    boomSound.currentTime = 0;
    boomSound.play();
  }

  moveBox();
});

/* ================= START GAME ================= */
function startGame() {
  let name = document.getElementById("playerName").value || "Player";

  difficulty = document.getElementById("difficulty").value;
  let setting = difficultySettings[difficulty];

  score = 0;
  time = setting.time;
  combo = 0;
  gameRunning = true;

  updateMissions("play");

  scoreEl.innerText = score;
  timeEl.innerText = time;
  result.innerText = "";

  if (settings.music) {
    bgm.currentTime = 0;
    bgm.play();
  }

  moveBox();

  let timer = setInterval(() => {
    time--;
    timeEl.innerText = time;
    combo = 0;

    if (time <= 0) {
      clearInterval(timer);
      gameRunning = false;
      bgm.pause();

      leaderboard.push({ name, score });
      leaderboard.sort((a,b)=>b.score-a.score);
      leaderboard = leaderboard.slice(0,5);

      localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
      updateLeaderboard();

      result.innerText = "👑 FINAL SCORE: " + score;
    }
  }, 1000);

  let mover = setInterval(() => {
    if (!gameRunning) return clearInterval(mover);
    moveBox();
  }, setting.speed);
}

/* ================= SETTINGS ================= */
function toggleSettings() {
  document.getElementById("settings").classList.toggle("hidden");
}

/* ================= BACKGROUND ================= */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = Array.from({ length: 100 }, () => ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  size: Math.random()*2,
  speed: Math.random()*1
}));

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "white";

  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random()*canvas.width;
    }
  });

  requestAnimationFrame(draw);
}
draw();