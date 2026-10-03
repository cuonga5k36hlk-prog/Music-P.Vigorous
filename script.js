/* =========================================================
   PHÀM NHÂN THÍNH ÂM CÁC - STUDIO EQUALIZER & COLOR FUSION
========================================================= */

const DEFAULT_PLAYLIST = [
  {
    id: 1,
    title: "Món quà",
    artist: "Dangrangto",
    src: "https://files.catbox.moe/9fvwip.mp3",
    cover: "https://img.youtube.com/vi/a6pUdErpOgw/maxresdefault.jpg"
  },
  {
    id: 2,
    title: "Đánh rơi (feat. MICKEY)",
    artist: "Dangrangto",
    src: "https://files.catbox.moe/wdyj9j.mp3",
    cover: "https://img.youtube.com/vi/Tv0w9-bpPpk/maxresdefault.jpg"
  },
  {
    id: 3,
    title: "Phàm Nhân Tông Môn Khúc",
    artist: "Thanh Vân Tu Sĩ",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Tinh Hải Phiêu Lưu Bi Ký",
    artist: "Loạn Tinh Hải Cổ Tu",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
  }
];

let playlist = [];
try {
  const saved = localStorage.getItem("pntt_playlist");
  playlist = saved ? JSON.parse(saved) : DEFAULT_PLAYLIST;
} catch (e) {
  playlist = DEFAULT_PLAYLIST;
}

let currentIndex = parseInt(localStorage.getItem("pntt_current_index")) || 0;
if (currentIndex >= playlist.length) currentIndex = 0;

let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let lastVolume = 0.7;

// DOM Elements
const audio = document.getElementById("audio-engine");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const trackCover = document.getElementById("track-cover");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const disc = document.getElementById("disc");
const ambientGlow = document.getElementById("ambient-glow");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volumeSlider = document.getElementById("volume-slider");
const volIcon = document.getElementById("vol-icon");
const playlistContainer = document.getElementById("playlist-items");
const searchInput = document.getElementById("search-input");
const themeToggle = document.getElementById("theme-toggle");
const moodDropdown = document.getElementById("mood-dropdown");
const sleepTimerSelect = document.getElementById("sleep-timer-select");
const timerDisplay = document.getElementById("timer-display");
const lightningOverlay = document.getElementById("lightning-overlay");
const cinematicToggle = document.getElementById("cinematic-toggle");
const playerCard = document.getElementById("player-card");

// Hộ Đạo Linh Thú
const spiritualPet = document.getElementById("spiritual-pet");
const petSpeech = document.getElementById("pet-speech");

// Equalizer DOM
const eqModal = document.getElementById("eq-modal");
const eqToggleBtn = document.getElementById("eq-toggle-btn");
const closeEqBtn = document.getElementById("close-eq-btn");
const presetBtns = document.querySelectorAll(".preset-btn");

// View Switcher Elements
const viewSongsBtn = document.getElementById("view-songs-btn");
const viewAlbumsBtn = document.getElementById("view-albums-btn");
const songsView = document.getElementById("songs-view");
const albumsView = document.getElementById("albums-view");
const albumGrid = document.getElementById("album-grid");
const albumDetailHeader = document.getElementById("album-detail-header");
const albumDetailTitle = document.getElementById("album-detail-title");
const btnBackAlbums = document.getElementById("btn-back-albums");

// Modal Elements
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const addModal = document.getElementById("add-modal");
const tabBtns = document.querySelectorAll(".tab-btn");
const urlForm = document.getElementById("url-form");
const fileForm = document.getElementById("file-form");

/* =========================================================
   1. QUẢN LÝ PHÁT NHẠC
========================================================= */
function savePlaylistToStorage() {
  try {
    const filterSaved = playlist.filter(track => !track.src.startsWith("blob:"));
    localStorage.setItem("pntt_playlist", JSON.stringify(filterSaved));
    localStorage.setItem("pntt_current_index", currentIndex);
  } catch (e) {
    console.log("LocalStorage lỗi:", e);
  }
}

function initPlayer() {
  renderPlaylist();
  renderAlbumGrid();
  loadTrack(currentIndex);
}

function loadTrack(index) {
  if (playlist.length === 0) return;
  currentIndex = index;
  const track = playlist[currentIndex];

  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackCover.src = track.cover || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop";

  savePlaylistToStorage();
  updatePlaylistHighlight();
  resetProgress();
}

function renderPlaylist(filterKeyword = "", targetContainer = playlistContainer, filterArtist = null) {
  targetContainer.innerHTML = "";
  const keyword = filterKeyword.toLowerCase().trim();

  let hasItems = false;
  playlist.forEach((track, index) => {
    if (filterArtist && track.artist !== filterArtist) return;

    const match = track.title.toLowerCase().includes(keyword) || track.artist.toLowerCase().includes(keyword);
    if (!match) return;

    hasItems = true;
    const card = document.createElement("div");
    card.classList.add("song-card");
    if (index === currentIndex) card.classList.add("active");

    card.innerHTML = `
      <img src="${track.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'}" class="song-thumb" alt="thumb">
      <div class="song-details">
        <div class="song-name">${track.title}</div>
        <div class="song-author">${track.artist}</div>
      </div>
      <button class="btn-remove" data-id="${track.id}" title="Xóa bỏ"><i class="fa-solid fa-trash-can"></i></button>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-remove")) return;
      loadTrack(index);
      playTrack();
    });

    const removeBtn = card.querySelector(".btn-remove");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSong(track.id);
    });

    targetContainer.appendChild(card);
  });

  if (!hasItems) {
    targetContainer.innerHTML = `<div style="text-align:center; padding: 25px; color: var(--text-muted); font-size:0.85rem;">Không tìm thấy khúc âm luật phù hợp...</div>`;
  }
}

function updatePlaylistHighlight() {
  const cards = document.querySelectorAll(".song-card");
  cards.forEach(card => {
    const removeBtn = card.querySelector(".btn-remove");
    if (!removeBtn) return;
    const trackId = parseInt(removeBtn.getAttribute("data-id"));
    const isCurrent = playlist[currentIndex] && playlist[currentIndex].id === trackId;
    card.classList.toggle("active", isCurrent);
  });
}

function playTrack() {
  if (playlist.length === 0) return;
  setupAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  audio.play().then(() => {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    disc.classList.add("spinning");
    setPetState("awake");
  }).catch(e => console.log("Chờ tương tác từ người dùng:", e));
}

function pauseTrack() {
  isPlaying = false;
  audio.pause();
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  disc.classList.remove("spinning");
  setPetState("sleeping");
}

playBtn.addEventListener("click", () => {
  isPlaying ? pauseTrack() : playTrack();
});

function nextTrack() {
  if (playlist.length === 0) return;
  if (isShuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentIndex && playlist.length > 1);
    currentIndex = nextIndex;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  loadTrack(currentIndex);
  playTrack();
}

function prevTrack() {
  if (playlist.length === 0) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
  playTrack();
}

nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

audio.addEventListener("ended", () => {
  if (sleepTimerSelect.value === "end_of_track") {
    pauseTrack();
    resetSleepTimer();
    return;
  }
  if (isRepeat) {
    playTrack();
  } else {
    nextTrack();
  }
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const current = audio.currentTime;
    const duration = audio.duration;
    const percent = (current / duration) * 100;
    progressFill.style.width = `${percent}%`;

    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(duration);
  }
});

progressBar.addEventListener("click", (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

volumeSlider.addEventListener("input", (e) => {
  setVolume(e.target.value);
});

function setVolume(val) {
  val = Math.max(0, Math.min(1, val));
  audio.volume = val;
  volumeSlider.value = val;
  if (val == 0) {
    volIcon.className = "fa-solid fa-volume-xmark";
  } else if (val < 0.5) {
    volIcon.className = "fa-solid fa-volume-low";
  } else {
    volIcon.className = "fa-solid fa-volume-high";
  }
}

volIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    setVolume(0);
  } else {
    setVolume(lastVolume || 0.7);
  }
});

function resetProgress() {
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "00:00";
  durationEl.textContent = "00:00";
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}

/* =========================================================
   2. HỆ THỐNG ALBUM CA SĨ
========================================================= */
viewSongsBtn.addEventListener("click", () => {
  viewSongsBtn.classList.add("active");
  viewAlbumsBtn.classList.remove("active");
  songsView.classList.add("active");
  albumsView.classList.remove("active");
});

viewAlbumsBtn.addEventListener("click", () => {
  viewAlbumsBtn.classList.add("active");
  viewSongsBtn.classList.remove("active");
  albumsView.classList.add("active");
  songsView.classList.remove("active");
  renderAlbumGrid();
});

function getAlbumsData() {
  const albumsMap = {};
  playlist.forEach(track => {
    const artistName = track.artist ? track.artist.trim() : "Vô Danh";
    if (!albumsMap[artistName]) {
      albumsMap[artistName] = {
        artist: artistName,
        cover: track.cover,
        tracks: []
      };
    }
    albumsMap[artistName].tracks.push(track);
  });
  return Object.values(albumsMap);
}

function renderAlbumGrid() {
  albumGrid.innerHTML = "";
  albumDetailHeader.style.display = "none";
  albumGrid.style.display = "grid";

  const albums = getAlbumsData();
  albums.forEach(album => {
    const card = document.createElement("div");
    card.className = "album-card";
    card.innerHTML = `
      <div class="album-cover-wrap">
        <img src="${album.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'}" alt="cover">
      </div>
      <div class="album-artist-name">${album.artist}</div>
      <div class="album-track-count">${album.tracks.length} Khúc Phổ</div>
    `;

    card.addEventListener("click", () => {
      openAlbumDetail(album);
    });

    albumGrid.appendChild(card);
  });
}

function openAlbumDetail(album) {
  albumGrid.style.display = "none";
  albumDetailHeader.style.display = "flex";
  albumDetailTitle.textContent = `Album: ${album.artist} (${album.tracks.length} bài)`;

  let detailList = document.getElementById("album-detail-list");
  if (!detailList) {
    detailList = document.createElement("div");
    detailList.id = "album-detail-list";
    detailList.className = "playlist-items";
    albumsView.appendChild(detailList);
  }
  detailList.style.display = "flex";
  renderPlaylist(searchInput.value, detailList, album.artist);
}

btnBackAlbums.addEventListener("click", () => {
  const detailList = document.getElementById("album-detail-list");
  if (detailList) detailList.style.display = "none";
  renderAlbumGrid();
});

/* =========================================================
   3. BỘ CÂN BẰNG ÂM THANH NGŨ HÀNH (5-BAND MASTER EQUALIZER)
========================================================= */
let eqFilters = [];

function initEqualizer(ctx, sourceNode) {
  const freqs = [60, 250, 1000, 4000, 12000];
  const types = ["lowshelf", "peaking", "peaking", "peaking", "highshelf"];

  let lastNode = sourceNode;
  eqFilters = freqs.map((freq, i) => {
    const filter = ctx.createBiquadFilter();
    filter.type = types[i];
    filter.frequency.value = freq;
    filter.gain.value = 0;
    lastNode.connect(filter);
    lastNode = filter;
    return filter;
  });

  return lastNode; // Node cuối nối vào Analyser
}

eqToggleBtn.addEventListener("click", () => eqModal.classList.toggle("open"));
closeEqBtn.addEventListener("click", () => eqModal.classList.remove("open"));

const eqSliders = {
  60: document.getElementById("eq-60"),
  250: document.getElementById("eq-250"),
  1000: document.getElementById("eq-1k"),
  4000: document.getElementById("eq-4k"),
  12000: document.getElementById("eq-12k")
};

Object.keys(eqSliders).forEach((freq, index) => {
  eqSliders[freq].addEventListener("input", (e) => {
    if (eqFilters[index]) {
      eqFilters[index].gain.value = parseFloat(e.target.value);
    }
  });
});

const PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass: [7, 5, -1, 1, 2],
  vocal: [-2, 1, 5, 4, 1],
  cinema: [6, 2, -2, 3, 5]
};

presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    presetBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const preset = PRESETS[btn.getAttribute("data-preset")];
    if (preset) {
      preset.forEach((val, i) => {
        if (eqFilters[i]) eqFilters[i].gain.value = val;
      });
      document.getElementById("eq-60").value = preset[0];
      document.getElementById("eq-250").value = preset[1];
      document.getElementById("eq-1k").value = preset[2];
      document.getElementById("eq-4k").value = preset[3];
      document.getElementById("eq-12k").value = preset[4];
    }
  });
});

/* =========================================================
   4. ĐẠI CANH KIẾM TRẬN (28 THANH TRÚC PHONG VÂN KIẾM)
========================================================= */
const vCanvas = document.getElementById("visualizer-canvas");
const vCtx = vCanvas.getContext("2d");
let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;
let isHighEnergy = false;
let swordRotationAngle = 0;

function setupAudioContext() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audio);

    // Nối qua bộ Master EQ 5-band
    const finalNode = initEqualizer(audioCtx, source);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    finalNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    drawVisualizer();
  } catch (err) {
    console.log("AudioContext CORS:", err);
  }
}

function drawFlyingSword(ctx, x, y, angle, length, color, glowColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(length, 0);
  ctx.lineTo(length * 0.2, -4.5);
  ctx.lineTo(-length * 0.25, -2);
  ctx.lineTo(-length * 0.25, 2);
  ctx.lineTo(length * 0.2, 4.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(length * 0.9, 0);
  ctx.lineTo(-length * 0.2, 0);
  ctx.stroke();

  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(-length * 0.28, -7, 4, 14);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(-length * 0.55, -2, length * 0.27, 4);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(-length * 0.58, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);

  if (!analyser || !isPlaying) return;

  analyser.getByteFrequencyData(dataArray);

  let bassSum = 0;
  for (let i = 0; i < 8; i++) {
    bassSum += dataArray[i];
  }
  const bassAvg = bassSum / 8;
  const scale = 1 + (bassAvg / 255) * 0.08;
  disc.style.transform = `scale(${scale})`;

  if (ambientGlow) {
    ambientGlow.style.transform = `scale(${1 + (bassAvg / 255) * 0.28})`;
    ambientGlow.style.opacity = `${0.4 + (bassAvg / 255) * 0.55}`;
  }

  isHighEnergy = bassAvg > 195;

  if (isHighEnergy) {
    setPetState("excited");
    triggerPetSparks();
  } else {
    setPetState("awake");
  }

  const centerX = vCanvas.width / 2;
  const centerY = vCanvas.height / 2;
  const numSwords = 28;
  const baseRadius = 126;
  const mood = moodDropdown ? moodDropdown.value : "mood-thanhvan";

  let swordColor = "#10b981";
  let glowColor = "rgba(16, 185, 129, 0.95)";
  if (mood === "mood-loantinhhai") {
    swordColor = "#38bdf8";
    glowColor = "rgba(56, 189, 248, 0.95)";
  } else if (mood === "mood-dokiep") {
    swordColor = "#c084fc";
    glowColor = "rgba(192, 132, 252, 0.95)";
  }

  swordRotationAngle += 0.007;

  for (let i = 0; i < numSwords; i++) {
    const val = dataArray[i % dataArray.length] || 0;
    const progress = val / 255;
    const angle = (i * (Math.PI * 2)) / numSwords + swordRotationAngle;

    const distance = baseRadius + progress * (isHighEnergy ? 45 : 25);
    const swordX = centerX + Math.cos(angle) * distance;
    const swordY = centerY + Math.sin(angle) * distance;
    const swordLength = 22 + progress * 14;
    const swordPointingAngle = angle + Math.PI / 2 + (progress * 0.2);

    drawFlyingSword(vCtx, swordX, swordY, swordPointingAngle, swordLength, swordColor, glowColor);
  }
}

/* =========================================================
   5. HỘ ĐẠO LINH THÚ (TƯƠNG TÁC THẦN THÚ)
========================================================= */
let currentPetState = "sleeping";

function setPetState(state) {
  if (currentPetState === state) return;
  currentPetState = state;
  spiritualPet.classList.remove("sleeping", "awake", "excited");
  spiritualPet.classList.add(state);

  if (state === "sleeping") {
    petSpeech.textContent = "Zzz...";
  } else if (state === "awake") {
    petSpeech.textContent = "Thính âm tịnh tâm...";
  } else if (state === "excited") {
    petSpeech.textContent = "Linh khí bạo phát!";
  }
}

function triggerPetSparks() {
  if (Math.random() > 0.4) return;
  const petRect = spiritualPet.getBoundingClientRect();
  const discRect = disc.getBoundingClientRect();
  const startX = petRect.left + petRect.width / 2;
  const startY = petRect.top + petRect.height / 2;
  const targetX = discRect.left + discRect.width / 2;
  const targetY = discRect.top + discRect.height / 2;

  swordSlashes.push({
    x: startX,
    y: startY,
    angle: Math.atan2(targetY - startY, targetX - startX),
    length: 60,
    life: 1.0,
    speed: 0.06
  });
}

function playPetChimeSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const pCtx = audioCtx || new AudioCtx();
    const osc = pCtx.createOscillator();
    const gain = pCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, pCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, pCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, pCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, pCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(pCtx.destination);
    osc.start();
    osc.stop(pCtx.currentTime + 0.36);
  } catch (e) {
    console.log(e);
  }
}

spiritualPet.addEventListener("click", () => {
  spiritualPet.classList.add("pet-petted");
  playPetChimeSound();

  const dialogue = ["Ngao ngao! (Vui vẻ)", "Linh lực +10!", "Hộ chủ đột phá!", "Khúc nhạc tuyệt diệu!"];
  petSpeech.textContent = dialogue[Math.floor(Math.random() * dialogue.length)];

  const petRect = spiritualPet.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    swordSlashes.push({
      x: petRect.left + petRect.width / 2,
      y: petRect.top + petRect.height / 2,
      angle: Math.random() * Math.PI * 2,
      length: 50,
      life: 1.0,
      speed: 0.05
    });
  }

  setTimeout(() => {
    spiritualPet.classList.remove("pet-petted");
  }, 450);
});

/* =========================================================
   6. HẠT TRỌNG LỰC NGHỊCH CHUYỂN
========================================================= */
const canvas = document.getElementById("ambient-canvas");
const ctx = canvas.getContext("2d");
let swordSlashes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class QiParticle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 20;
    this.size = Math.random() * 2.5 + 0.8;
    this.speedY = Math.random() * 0.7 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    if (isHighEnergy && isPlaying) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        this.reset();
      } else {
        this.x += (dx / dist) * 3.5;
        this.y += (dy / dist) * 3.5;
      }
    } else {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset();
    }
  }
  draw() {
    const style = getComputedStyle(document.body);
    ctx.fillStyle = style.getPropertyValue("--particle-color").trim() || "rgba(16, 185, 129, 0.7)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array.from({ length: 65 }, () => new QiParticle());

function drawSwordSlashes() {
  for (let i = swordSlashes.length - 1; i >= 0; i--) {
    const s = swordSlashes[i];
    s.life -= s.speed;
    if (s.life <= 0) {
      swordSlashes.splice(i, 1);
      continue;
    }
    const currentLen = s.length * (1 - s.life * 0.2);
    const dx = Math.cos(s.angle) * (currentLen / 2);
    const dy = Math.sin(s.angle) * (currentLen / 2);

    const mood = moodDropdown ? moodDropdown.value : "mood-thanhvan";
    let slashColor = "16, 185, 129";
    if (mood === "mood-loantinhhai") slashColor = "56, 189, 248";
    if (mood === "mood-dokiep") slashColor = "236, 72, 153";

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = `rgba(${slashColor}, ${s.life})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
    ctx.lineWidth = 3 * s.life;
    ctx.beginPath();
    ctx.moveTo(s.x - dx, s.y - dy);
    ctx.lineTo(s.x + dx, s.y + dy);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${slashColor}, ${s.life * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 25 * (1.5 - s.life), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function animateLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  drawSwordSlashes();
  requestAnimationFrame(animateLoop);
}
animateLoop();

window.addEventListener("click", (e) => {
  if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest(".modal-box") || e.target.closest(".spiritual-pet-wrapper")) {
    return;
  }
  const angle = Math.random() * Math.PI * 2;
  const length = Math.random() * 80 + 70;
  swordSlashes.push({ x: e.clientX, y: e.clientY, angle, length, life: 1.0, speed: 0.04 });
});

/* =========================================================
   7. LINH HẠP CHI ÂM
========================================================= */
const ambientDrawer = document.getElementById("ambient-drawer");
const ambientDrawerToggle = document.getElementById("ambient-drawer-toggle");
const closeAmbientDrawer = document.getElementById("close-ambient-drawer");

ambientDrawerToggle.addEventListener("click", () => ambientDrawer.classList.toggle("open"));
closeAmbientDrawer.addEventListener("click", () => ambientDrawer.classList.remove("open"));

let ambientCtx = null;
let soundNodes = {};

function initAmbientSounds() {
  if (ambientCtx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  ambientCtx = new AudioCtx();

  const bufferSize = ambientCtx.sampleRate * 2;
  const noiseBuffer = ambientCtx.createBuffer(1, bufferSize, ambientCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    output[i] = (b0 + b1 + b2) * 0.11;
  }

  function createNoiseSource(filterFreq) {
    const whiteNoise = ambientCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    const filter = ambientCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    const gain = ambientCtx.createGain();
    gain.gain.value = 0;
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ambientCtx.destination);
    whiteNoise.start();
    return gain;
  }

  soundNodes.rain = createNoiseSource(900);
  soundNodes.fire = createNoiseSource(350);
  soundNodes.waves = createNoiseSource(500);

  const osc = ambientCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 528;
  const oscGain = ambientCtx.createGain();
  oscGain.gain.value = 0;
  osc.connect(oscGain);
  oscGain.connect(ambientCtx.destination);
  osc.start();
  soundNodes.wind = oscGain;
}

document.querySelectorAll(".ambient-slider").forEach(slider => {
  slider.addEventListener("input", (e) => {
    initAmbientSounds();
    if (ambientCtx.state === "suspended") ambientCtx.resume();
    const type = e.target.id.replace("amb-", "");
    if (soundNodes[type]) {
      soundNodes[type].gain.setTargetAtTime(parseFloat(e.target.value) * 0.5, ambientCtx.currentTime, 0.05);
    }
  });
});

/* =========================================================
   8. THIÊN KIẾP LÔI ĐÌNH (QTE)
========================================================= */
const tribulationOverlay = document.getElementById("tribulation-overlay");
const qteStrikeBtn = document.getElementById("qte-strike-btn");
const qteProgressFill = document.getElementById("qte-progress-fill");
const qteTimerEl = document.getElementById("qte-timer");
const cultivationBadge = document.getElementById("cultivation-badge");

let qteProgress = 0;
let qteTimeLeft = 10;
let qteTimerInterval = null;
let isTribulationActive = false;

function startTribulationEvent() {
  if (isTribulationActive) return;
  isTribulationActive = true;
  qteProgress = 0;
  qteTimeLeft = 10;
  qteProgressFill.style.width = "0%";
  qteTimerEl.textContent = "10s";

  if (audio) audio.volume = 0.2;
  tribulationOverlay.classList.add("active");

  qteTimerInterval = setInterval(() => {
    qteTimeLeft--;
    qteTimerEl.textContent = `${qteTimeLeft}s`;
    if (qteTimeLeft <= 0) {
      failTribulation();
    }
  }, 1000);
}

function strikeTribulation() {
  if (!isTribulationActive) return;
  qteProgress += 8.5;
  qteProgressFill.style.width = `${Math.min(100, qteProgress)}%`;

  if (lightningOverlay) {
    lightningOverlay.classList.add("flash");
    setTimeout(() => lightningOverlay.classList.remove("flash"), 90);
  }

  if (qteProgress >= 100) {
    succeedTribulation();
  }
}

function succeedTribulation() {
  clearInterval(qteTimerInterval);
  isTribulationActive = false;
  tribulationOverlay.classList.remove("active");
  if (audio) audio.volume = volumeSlider.value;

  alert("⚡ ĐỘ KIẾP THÀNH CÔNG! Đạo hữu đã đột phá cảnh giới, linh khí ngút trời!");
  totalListenSeconds += 600;
  localStorage.setItem("pntt_listen_seconds", totalListenSeconds);
  updateCultivationUI();
}

function failTribulation() {
  clearInterval(qteTimerInterval);
  isTribulationActive = false;
  tribulationOverlay.classList.remove("active");
  if (audio) audio.volume = volumeSlider.value;

  alert("☠️ ĐỘ KIẾP THẤT BẠI! Tâm ma quấy nhiễu, đạo hữu hãy tiếp tục tĩnh tâm thính âm...");
}

qteStrikeBtn.addEventListener("click", strikeTribulation);
cultivationBadge.addEventListener("click", startTribulationEvent);

/* =========================================================
   9. VẤN ĐẠO BỐC QUẺ
========================================================= */
const divineOracleBtn = document.getElementById("divine-oracle-btn");
const oracleModal = document.getElementById("oracle-modal");
const closeOracleBtn = document.getElementById("close-oracle-btn");
const oracleCylinder = document.getElementById("oracle-cylinder");
const oracleResult = document.getElementById("oracle-result");
const oracleGrade = document.getElementById("oracle-grade");
const oracleVerse = document.getElementById("oracle-verse");
const oracleAdvice = document.getElementById("oracle-advice");
const oraclePlayBtn = document.getElementById("oracle-play-btn");

let recommendedTrackIndex = 0;

const ORACLES = [
  { grade: "Thượng Thượng Quẻ", verse: "Đạo tâm kiên định, vạn kiếp bất diệt.", advice: "Khí vận dồi dào, hãy lắng nghe giai điệu hào hùng để ngộ đạo." },
  { grade: "Thượng Cát Quẻ", verse: "Gió lặng mây trong, thủy triều quy hải.", advice: "Thích hợp tịnh dưỡng tâm hồn cùng khúc nhạc Dangrangto êm dịu." },
  { grade: "Trung Bình Quẻ", verse: "Tâm ma dập dờn, sương mây che lối.", advice: "Hãy để âm luật cổ phong gột rửa mọi muộn phiền nơi phàm trần." }
];

divineOracleBtn.addEventListener("click", () => {
  oracleResult.style.display = "none";
  oracleModal.classList.add("open");
});

closeOracleBtn.addEventListener("click", () => oracleModal.classList.remove("open"));

oracleCylinder.addEventListener("click", () => {
  const chosen = ORACLES[Math.floor(Math.random() * ORACLES.length)];
  oracleGrade.textContent = chosen.grade;
  oracleVerse.textContent = `"${chosen.verse}"`;
  oracleAdvice.textContent = chosen.advice;
  recommendedTrackIndex = Math.floor(Math.random() * playlist.length);
  oracleResult.style.display = "block";
});

oraclePlayBtn.addEventListener("click", () => {
  oracleModal.classList.remove("open");
  loadTrack(recommendedTrackIndex);
  playTrack();
});

/* =========================================================
   10. HỆ THỐNG TU VI & CẢNH GIỚI THÍNH GIẢ
========================================================= */
let totalListenSeconds = parseInt(localStorage.getItem("pntt_listen_seconds")) || 0;

const REALMS = [
  { name: "Phàm Nhân", minSec: 0, maxSec: 300 },
  { name: "Luyện Khí Tầng 1", minSec: 300, maxSec: 900 },
  { name: "Trúc Cơ Sơ Kỳ", minSec: 900, maxSec: 2400 },
  { name: "Kết Đan Kỳ", minSec: 2400, maxSec: 5400 },
  { name: "Nguyên Anh Lão Tổ", minSec: 5400, maxSec: 999999 }
];

function updateCultivationUI() {
  const currentMinutes = Math.floor(totalListenSeconds / 60);
  const expTextEl = document.getElementById("exp-text");
  const realmTitleEl = document.getElementById("realm-title");
  const expFillEl = document.getElementById("exp-fill");

  if (expTextEl) expTextEl.textContent = `${currentMinutes}m`;

  let currentRealm = REALMS[0];
  for (let i = 0; i < REALMS.length; i++) {
    if (totalListenSeconds >= REALMS[i].minSec) {
      currentRealm = REALMS[i];
    }
  }

  if (realmTitleEl) realmTitleEl.textContent = currentRealm.name;

  if (expFillEl) {
    if (currentRealm.maxSec < 999999) {
      const range = currentRealm.maxSec - currentRealm.minSec;
      const currentProg = totalListenSeconds - currentRealm.minSec;
      const pct = Math.min(100, Math.floor((currentProg / range) * 100));
      expFillEl.style.width = `${pct}%`;

      if (pct >= 100 && !isTribulationActive) {
        startTribulationEvent();
      }
    } else {
      expFillEl.style.width = "100%";
    }
  }
}

setInterval(() => {
  if (isPlaying) {
    totalListenSeconds++;
    localStorage.setItem("pntt_listen_seconds", totalListenSeconds);
    updateCultivationUI();
  }
}, 1000);

/* =========================================================
   11. PHÍM TẮT & HẸN GIỜ TẮT
========================================================= */
window.addEventListener("keydown", (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
  if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
    return;
  }

  if (isTribulationActive && e.code === "Space") {
    e.preventDefault();
    strikeTribulation();
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      isPlaying ? pauseTrack() : playTrack();
      break;
    case "KeyF":
      e.preventDefault();
      document.body.classList.toggle("cinematic-mode");
      break;
    case "ArrowRight":
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      break;
    case "ArrowLeft":
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 5);
      break;
    case "ArrowUp":
      e.preventDefault();
      setVolume(audio.volume + 0.05);
      break;
    case "ArrowDown":
      e.preventDefault();
      setVolume(audio.volume - 0.05);
      break;
    case "KeyM":
      e.preventDefault();
      if (audio.volume > 0) {
        lastVolume = audio.volume;
        setVolume(0);
      } else {
        setVolume(lastVolume || 0.7);
      }
      break;
  }
});

let sleepTimerInterval = null;
let remainingSeconds = 0;

function resetSleepTimer() {
  if (sleepTimerInterval) clearInterval(sleepTimerInterval);
  sleepTimerInterval = null;
  remainingSeconds = 0;
  timerDisplay.textContent = "";
  sleepTimerSelect.value = "0";
}

sleepTimerSelect.addEventListener("change", (e) => {
  const val = e.target.value;
  if (sleepTimerInterval) clearInterval(sleepTimerInterval);

  if (val === "0") {
    timerDisplay.textContent = "";
    return;
  }

  if (val === "end_of_track") {
    timerDisplay.textContent = "⏳ Kết khúc";
    return;
  }

  const minutes = parseInt(val);
  remainingSeconds = minutes * 60;
  updateTimerDisplay();

  sleepTimerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      pauseTrack();
      resetSleepTimer();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
});

function updateTimerDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  timerDisplay.textContent = `⏳ ${m}:${s < 10 ? "0" : ""}${s}`;
}

searchInput.addEventListener("input", (e) => {
  renderPlaylist(e.target.value);
  const detailList = document.getElementById("album-detail-list");
  if (detailList && detailList.style.display !== "none") {
    const currentArtist = albumDetailTitle.textContent.replace("Album: ", "").split(" (")[0];
    renderPlaylist(e.target.value, detailList, currentArtist);
  }
});

if (moodDropdown) {
  moodDropdown.addEventListener("change", (e) => {
    const selectedMood = e.target.value;
    document.body.classList.remove("mood-thanhvan", "mood-loantinhhai", "mood-dokiep");
    document.body.classList.add(selectedMood);
    if (vCtx) vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
  });
}

// Modal Thêm Bài Hát
openModalBtn.addEventListener("click", () => addModal.classList.add("open"));
closeModalBtn.addEventListener("click", () => addModal.classList.remove("open"));

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const targetTab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.getElementById(`${targetTab}-form`).classList.add("active");
  });
});

urlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("url-title").value.trim();
  const artist = document.getElementById("url-artist").value.trim() || "Ẩn Danh Tiên Giả";
  const src = document.getElementById("url-audio").value.trim();
  const cover = document.getElementById("url-cover").value.trim() || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop";

  const newSong = { id: Date.now(), title, artist, src, cover };
  playlist.push(newSong);
  savePlaylistToStorage();
  renderPlaylist(searchInput.value);
  renderAlbumGrid();
  addModal.classList.remove("open");
  urlForm.reset();

  loadTrack(playlist.length - 1);
  playTrack();
});

fileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("local-audio-file");
  const file = fileInput.files[0];
  if (!file) return;

  const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
  const title = document.getElementById("file-title").value.trim() || defaultTitle;
  const artist = document.getElementById("file-artist").value.trim() || "Bản Địa Cổ Tu";
  const blobUrl = URL.createObjectURL(file);

  const newSong = {
    id: Date.now(),
    title,
    artist,
    src: blobUrl,
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop"
  };

  playlist.push(newSong);
  renderPlaylist(searchInput.value);
  renderAlbumGrid();
  addModal.classList.remove("open");
  fileForm.reset();

  loadTrack(playlist.length - 1);
  playTrack();
});

function removeSong(id) {
  if (playlist.length <= 1) {
    alert("Cần giữ ít nhất 1 khúc phổ trong Tiên Các!");
    return;
  }
  const index = playlist.findIndex(track => track.id === id);
  if (index !== -1) {
    playlist.splice(index, 1);
    savePlaylistToStorage();
    if (index === currentIndex) {
      currentIndex = currentIndex % playlist.length;
      loadTrack(currentIndex);
      if (isPlaying) playTrack();
    } else if (index < currentIndex) {
      currentIndex--;
    }
    renderPlaylist(searchInput.value);
    renderAlbumGrid();
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

initPlayer();
updateCultivationUI();
setPetState("sleeping");
