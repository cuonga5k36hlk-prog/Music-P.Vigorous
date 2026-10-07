/* =========================================================
   PHÀM NHÂN THÍNH ÂM CÁC - JAVASCRIPT CHUẨN TÂM CHUỘT
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
    title: "Tinh Hải Phiêu Lưu Bi Ký",
    artist: "Loạn Tinh Hải Cổ Tu",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Xương Rồng (Intro)",
    artist: "Dangrangto",
    src: "https://tmpfiles.org/dl/wUAyI367AT3S/dangrangto-xuongrongintroprod.donal.mp3",
    cover: "https://img.youtube.com/vi/Tv0w9-bpPpk/maxresdefault.jpg"
  }
];

let playlist = [];
try {
  const saved = localStorage.getItem("pntt_playlist");
  playlist = (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : DEFAULT_PLAYLIST;
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
const speedToggleBtn = document.getElementById("speed-toggle-btn");
const speedText = document.getElementById("speed-text");
const parallaxWrapper = document.getElementById("parallax-wrapper");
const swordCursor = document.getElementById("sword-cursor");
const greenDewdrop = document.getElementById("green-dewdrop");
const waveformDewGlow = document.getElementById("waveform-dew-glow");

// Waveform Box & Canvas
const waveformBox = document.getElementById("waveform-box");
const waveformCanvas = document.getElementById("waveform-canvas");
const waveformCtx = waveformCanvas ? waveformCanvas.getContext("2d") : null;
const waveformProgress = document.getElementById("waveform-progress");

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
    console.log("LocalStorage error:", e);
  }
}

function initPlayer() {
  renderPlaylist();
  renderAlbumGrid();
  loadTrack(currentIndex);
  drawStaticWaveform();
}

function loadTrack(index) {
  if (playlist.length === 0) return;
  currentIndex = index;
  const track = playlist[currentIndex];

  audio.src = track.src;
  audio.load();
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackCover.src = track.cover || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop";

  savePlaylistToStorage();
  updatePlaylistHighlight();
  resetProgress();
}

function renderPlaylist(filterKeyword = "", targetContainer = playlistContainer, filterArtist = null) {
  if (!targetContainer) return;
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

  audio.volume = parseFloat(volumeSlider.value) || 0.7;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isPlaying = true;
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      disc.classList.add("spinning");
    }).catch(e => {
      console.warn("Chờ người dùng tương tác:", e);
    });
  }
}

function pauseTrack() {
  isPlaying = false;
  audio.pause();
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  disc.classList.remove("spinning");
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
    if (waveformProgress) waveformProgress.style.width = `${percent}%`;

    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(duration);
  }
});

if (waveformBox) {
  waveformBox.addEventListener("click", (e) => {
    const rect = waveformBox.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    audio.currentTime = (clickX / rect.width) * audio.duration;
  });
}

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
  if (waveformProgress) waveformProgress.style.width = "0%";
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
   2. GIỌT LỤC DỊCH CHƯỞNG THIÊN BÌNH
========================================================= */
function triggerGreenDewdrop() {
  if (!greenDewdrop || !waveformDewGlow) return;
  greenDewdrop.classList.remove("dripping");
  void greenDewdrop.offsetWidth;
  greenDewdrop.classList.add("dripping");

  setTimeout(() => {
    waveformDewGlow.classList.remove("glow-active");
    void waveformDewGlow.offsetWidth;
    waveformDewGlow.classList.add("glow-active");
  }, 1000);
}

setInterval(() => {
  if (isPlaying) {
    triggerGreenDewdrop();
  }
}, 11000);

/* =========================================================
   3. NGỰ KIẾM PHI HÀNH (KHÔNG NHẢY CHUỘT, CHUẨN MŨI CLICK)
========================================================= */
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let swordTrailPoints = [];
let waterRipples = [];

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Ghim cố định đỉnh mũi nhọn của kiếm vào đúng tọa độ chuột
  if (swordCursor) {
    swordCursor.style.left = `${mouseX}px`;
    swordCursor.style.top = `${mouseY}px`;
  }

  swordTrailPoints.push({
    x: mouseX,
    y: mouseY,
    life: 1.0,
    size: 7
  });

  if (!document.body.classList.contains("cinematic-mode") && parallaxWrapper) {
    const xRot = (mouseX - window.innerWidth / 2) / 30;
    const yRot = (mouseY - window.innerHeight / 2) / 30;
    parallaxWrapper.style.transform = `rotateY(${xRot}deg) rotateX(${-yRot}deg)`;
  }
});

// Nhấn chuột: Nhún kiếm tạo phản hồi chạm
window.addEventListener("mousedown", (e) => {
  if (swordCursor) {
    swordCursor.classList.add("clicking");
  }

  // Bỏ qua tạo kiếm chém nếu click trúng nút bấm, thanh trượt, menu
  if (e.target.closest("button, select, input, a, .song-card, .album-card, .ambient-drawer, .modal-box, .volume-container, .waveform-box")) {
    return;
  }

  waterRipples.push({
    x: e.clientX,
    y: e.clientY,
    radius: 4,
    maxRadius: 75,
    alpha: 0.8
  });

  for (let i = 0; i < 5; i++) {
    swordSlashes.push({
      x: e.clientX,
      y: e.clientY,
      angle: Math.random() * Math.PI * 2,
      length: Math.random() * 60 + 35,
      life: 1.0,
      speed: 0.06
    });
  }
});

window.addEventListener("mouseup", () => {
  if (swordCursor) {
    swordCursor.classList.remove("clicking");
  }
});

/* =========================================================
   4. CHƯỞNG THIÊN BÌNH - TỐC ĐỘ PHÁT
========================================================= */
const SPEEDS = [1.0, 1.25, 1.5, 0.75];
let currentSpeedIndex = 0;

if (speedToggleBtn) {
  speedToggleBtn.addEventListener("click", () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % SPEEDS.length;
    const speed = SPEEDS[currentSpeedIndex];
    audio.playbackRate = speed;
    speedText.textContent = `${speed}x`;
    triggerGreenDewdrop();
  });
}

/* =========================================================
   5. DẢI SÓNG ÂM WAVEFORM CANVAS
========================================================= */
function drawStaticWaveform() {
  if (!waveformCanvas || !waveformCtx) return;
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;
  waveformCtx.clearRect(0, 0, w, h);

  const bars = 45;
  const barWidth = w / bars - 2;

  for (let i = 0; i < bars; i++) {
    const barHeight = Math.sin(i * 0.2) * 8 + Math.cos(i * 0.4) * 5 + 12;
    const x = i * (barWidth + 2);
    const y = (h - barHeight) / 2;

    const grad = waveformCtx.createLinearGradient(0, y, 0, y + barHeight);
    grad.addColorStop(0, "#10b981");
    grad.addColorStop(1, "#f59e0b");

    waveformCtx.fillStyle = grad;
    waveformCtx.fillRect(x, y, barWidth, barHeight);
  }
}

/* =========================================================
   6. BÁT QUÁI TRẬN ĐỒ & TÀN ẢNH PHI KIẾM
========================================================= */
const vCanvas = document.getElementById("visualizer-canvas");
const vCtx = vCanvas ? vCanvas.getContext("2d") : null;
let audioCtx = null;
let swordRotationAngle = 0;
let baguaAngle = 0;
let burstProgress = 0;

function setupAudioContext() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    drawVisualizer();
  } catch (err) {
    console.log("AudioContext Init Error:", err);
  }
}

function drawBaguaTrigram(ctx, cx, cy, radius, pulse) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(baguaAngle);

  ctx.strokeStyle = `rgba(245, 158, 11, ${0.25 + pulse * 0.35})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  const trigrams = [
    [1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1],
    [1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]
  ];

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius - 12);

    const bars = trigrams[i];
    ctx.fillStyle = `rgba(245, 158, 11, ${0.45 + pulse * 0.5})`;
    bars.forEach((type, lineIdx) => {
      const y = lineIdx * 4;
      if (type === 1) {
        ctx.fillRect(-10, y, 20, 2);
      } else {
        ctx.fillRect(-10, y, 8, 2);
        ctx.fillRect(2, y, 8, 2);
      }
    });
    ctx.restore();
  }
  ctx.restore();
}

function drawFlyingSword(ctx, x, y, angle, length, color, opacity = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;

  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * opacity;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(length, 0);
  ctx.lineTo(length * 0.2, -4.5);
  ctx.lineTo(-length * 0.25, -2);
  ctx.lineTo(-length * 0.25, 2);
  ctx.lineTo(length * 0.2, 4.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * opacity})`;
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
  if (!vCtx || !vCanvas) return;
  vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);

  if (!isPlaying) return;

  const time = Date.now() / 250;
  const bassAvg = 75 + Math.sin(time) * 45;
  const isHighEnergy = bassAvg > 105;

  const scale = 1 + (bassAvg / 255) * 0.08;
  disc.style.transform = `scale(${scale})`;

  if (ambientGlow) {
    ambientGlow.style.transform = `scale(${1 + (bassAvg / 255) * 0.28})`;
    ambientGlow.style.opacity = `${0.4 + (bassAvg / 255) * 0.55}`;
  }

  const centerX = vCanvas.width / 2;
  const centerY = vCanvas.height / 2;
  const baseRadius = 126;

  baguaAngle += 0.005;
  drawBaguaTrigram(vCtx, centerX, centerY, baseRadius - 8, bassAvg / 255);

  if (isHighEnergy && burstProgress === 0) {
    burstProgress = 1.0;
  }
  if (burstProgress > 0) {
    burstProgress -= 0.04;
    if (burstProgress < 0) burstProgress = 0;
  }

  const numSwords = 28;
  swordRotationAngle += 0.007;

  for (let i = 0; i < numSwords; i++) {
    const val = 60 + Math.sin(i * 0.45 + time * 1.5) * 55;
    const progress = Math.max(0, val) / 255;
    const angle = (i * (Math.PI * 2)) / numSwords + swordRotationAngle;

    const burstDist = burstProgress * 65;
    const distance = baseRadius + progress * 25 + burstDist;

    const swordX = centerX + Math.cos(angle) * distance;
    const swordY = centerY + Math.sin(angle) * distance;
    const swordLength = 22 + progress * 14 + burstProgress * 12;
    const swordPointingAngle = burstProgress > 0.2 ? angle : angle + Math.PI / 2 + (progress * 0.2);

    const style = getComputedStyle(document.body);
    const primaryColor = style.getPropertyValue("--primary-color").trim() || "#10b981";

    const ghostAngle2 = angle - 0.07;
    const gx2 = centerX + Math.cos(ghostAngle2) * distance;
    const gy2 = centerY + Math.sin(ghostAngle2) * distance;
    drawFlyingSword(vCtx, gx2, gy2, swordPointingAngle - 0.07, swordLength * 0.9, primaryColor, 0.2);

    const ghostAngle1 = angle - 0.035;
    const gx1 = centerX + Math.cos(ghostAngle1) * distance;
    const gy1 = centerY + Math.sin(ghostAngle1) * distance;
    drawFlyingSword(vCtx, gx1, gy1, swordPointingAngle - 0.035, swordLength * 0.95, primaryColor, 0.45);

    drawFlyingSword(vCtx, swordX, swordY, swordPointingAngle, swordLength, primaryColor, 1.0);
  }
}

/* =========================================================
   7. MẶT HỒ SÓNG NƯỚC & VỆT KIẾM CHUỘT
========================================================= */
const canvas = document.getElementById("ambient-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let swordSlashes = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawEffectsLoop() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const style = getComputedStyle(document.body);
  const rgb = style.getPropertyValue("--sword-trail-color").trim() || "16, 185, 129";

  for (let i = waterRipples.length - 1; i >= 0; i--) {
    const r = waterRipples[i];
    r.radius += 2.2;
    r.alpha -= 0.02;
    if (r.alpha <= 0) {
      waterRipples.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb}, ${r.alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${rgb}, 0.8)`;
    ctx.stroke();
    ctx.restore();
  }

  for (let i = swordTrailPoints.length - 1; i >= 0; i--) {
    const pt = swordTrailPoints[i];
    pt.life -= 0.038;
    if (pt.life <= 0) {
      swordTrailPoints.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${pt.life * 0.75})`;
    ctx.shadowColor = `rgba(${rgb}, 0.9)`;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();
  }

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

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = `rgba(${rgb}, ${s.life})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
    ctx.lineWidth = 3 * s.life;
    ctx.beginPath();
    ctx.moveTo(s.x - dx, s.y - dy);
    ctx.lineTo(s.x + dx, s.y + dy);
    ctx.stroke();
    ctx.restore();
  }

  requestAnimationFrame(drawEffectsLoop);
}
drawEffectsLoop();

/* =========================================================
   8. HỆ THỐNG ALBUM CA SĨ
========================================================= */
if (viewSongsBtn && viewAlbumsBtn) {
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
}

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
  if (!albumGrid) return;
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

if (btnBackAlbums) {
  btnBackAlbums.addEventListener("click", () => {
    const detailList = document.getElementById("album-detail-list");
    if (detailList) detailList.style.display = "none";
    renderAlbumGrid();
  });
}

/* =========================================================
   9. NÚT ĐIỆN ẢNH & PHÍM TẮT
========================================================= */
if (cinematicToggle) {
  cinematicToggle.addEventListener("click", () => {
    document.body.classList.toggle("cinematic-mode");
    cinematicToggle.classList.toggle("active");
  });
}

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
      if (cinematicToggle) cinematicToggle.classList.toggle("active");
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

/* =========================================================
   10. LINH HẠP CHI ÂM
========================================================= */
const ambientDrawer = document.getElementById("ambient-drawer");
const ambientDrawerToggle = document.getElementById("ambient-drawer-toggle");
const closeAmbientDrawer = document.getElementById("close-ambient-drawer");

if (ambientDrawerToggle && ambientDrawer) {
  ambientDrawerToggle.addEventListener("click", () => ambientDrawer.classList.toggle("open"));
}
if (closeAmbientDrawer && ambientDrawer) {
  closeAmbientDrawer.addEventListener("click", () => ambientDrawer.classList.remove("open"));
}

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
   11. THIÊN KIẾP LÔI ĐÌNH (QTE)
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

if (qteStrikeBtn) qteStrikeBtn.addEventListener("click", strikeTribulation);
if (cultivationBadge) cultivationBadge.addEventListener("click", startTribulationEvent);

/* =========================================================
   12. VẤN ĐẠO BỐC QUẺ
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

if (divineOracleBtn && oracleModal) {
  divineOracleBtn.addEventListener("click", () => {
    oracleResult.style.display = "none";
    oracleModal.classList.add("open");
  });
}

if (closeOracleBtn && oracleModal) {
  closeOracleBtn.addEventListener("click", () => oracleModal.classList.remove("open"));
}

if (oracleCylinder) {
  oracleCylinder.addEventListener("click", () => {
    const chosen = ORACLES[Math.floor(Math.random() * ORACLES.length)];
    oracleGrade.textContent = chosen.grade;
    oracleVerse.textContent = `"${chosen.verse}"`;
    oracleAdvice.textContent = chosen.advice;
    recommendedTrackIndex = Math.floor(Math.random() * playlist.length);
    oracleResult.style.display = "block";
  });
}

if (oraclePlayBtn) {
  oraclePlayBtn.addEventListener("click", () => {
    oracleModal.classList.remove("open");
    loadTrack(recommendedTrackIndex);
    playTrack();
  });
}

/* =========================================================
   13. HỆ THỐNG TU VI & CẢNH GIỚI THÍNH GIẢ
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
   14. HẸN GIỜ TẮT & MODAL NẠP NHẠC
========================================================= */
let sleepTimerInterval = null;
let remainingSeconds = 0;

function resetSleepTimer() {
  if (sleepTimerInterval) clearInterval(sleepTimerInterval);
  sleepTimerInterval = null;
  remainingSeconds = 0;
  timerDisplay.textContent = "";
  sleepTimerSelect.value = "0";
}

if (sleepTimerSelect) {
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
}

function updateTimerDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  timerDisplay.textContent = `⏳ ${m}:${s < 10 ? "0" : ""}${s}`;
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    renderPlaylist(e.target.value);
    const detailList = document.getElementById("album-detail-list");
    if (detailList && detailList.style.display !== "none") {
      const currentArtist = albumDetailTitle.textContent.replace("Album: ", "").split(" (")[0];
      renderPlaylist(e.target.value, detailList, currentArtist);
    }
  });
}

if (moodDropdown) {
  moodDropdown.addEventListener("change", (e) => {
    const selectedMood = e.target.value;
    document.body.classList.remove("mood-thanhvan", "mood-loantinhhai", "mood-dokiep");
    document.body.classList.add(selectedMood);
    if (vCtx) vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
  });
}

if (openModalBtn && addModal) {
  openModalBtn.addEventListener("click", () => addModal.classList.add("open"));
}
if (closeModalBtn && addModal) {
  closeModalBtn.addEventListener("click", () => addModal.classList.remove("open"));
}

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const targetTab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.getElementById(`${targetTab}-form`).classList.add("active");
  });
});

if (urlForm) {
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
}

if (fileForm) {
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
}

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

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

// Khởi chạy hệ thống chuẩn xác
initPlayer();
updateCultivationUI();
