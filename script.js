/* =========================================================
   PHÀM NHÂN THÍNH ÂM CÁC - AUDIO VISUALIZER & TÍNH NĂNG UX
========================================================= */

// Danh sách bài hát mặc định
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
  }
];

// 1. Tải Playlist & Trạng thái từ LocalStorage
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
const magicCircle = document.getElementById("magic-circle");
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

// Modal Elements
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const addModal = document.getElementById("add-modal");
const tabBtns = document.querySelectorAll(".tab-btn");
const urlForm = document.getElementById("url-form");
const fileForm = document.getElementById("file-form");

/* =========================================================
   1. QUẢN LÝ PHÁT NHẠC & LOCALSTORAGE
========================================================= */
function savePlaylistToStorage() {
  try {
    // Chỉ lưu các bài hát URL (loại trừ blob url máy cá nhân vì sẽ hết hạn khi reload)
    const filterSaved = playlist.filter(track => !track.src.startsWith("blob:"));
    localStorage.setItem("pntt_playlist", JSON.stringify(filterSaved));
    localStorage.setItem("pntt_current_index", currentIndex);
  } catch (e) {
    console.log("LocalStorage lỗi:", e);
  }
}

function initPlayer() {
  renderPlaylist();
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

function renderPlaylist(filterKeyword = "") {
  playlistContainer.innerHTML = "";
  const keyword = filterKeyword.toLowerCase().trim();

  let hasItems = false;
  playlist.forEach((track, index) => {
    // Linh Thức Dò Tìm: Lọc theo tên bài hát hoặc tác giả
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

    playlistContainer.appendChild(card);
  });

  if (!hasItems) {
    playlistContainer.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-size:0.85rem;">Không tìm thấy khúc âm luật phù hợp...</div>`;
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
    magicCircle.classList.add("active");
  }).catch(e => console.log("Chờ tương tác từ người dùng:", e));
}

function pauseTrack() {
  isPlaying = false;
  audio.pause();
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  disc.classList.remove("spinning");
  magicCircle.classList.remove("active");
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
  // Nếu đang bật hẹn giờ "Hết khúc này"
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

// Click icon loa để Mute / Unmute
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
   2. HẸN GIỜ TẮT NHẠC (TỊNH TÂM CHI HẠN)
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

/* =========================================================
   3. PHÍM TẮT ĐIỀU KHIỂN NHANH (BÀN PHÍM)
========================================================= */
window.addEventListener("keydown", (e) => {
  // Bỏ qua khi người dùng đang nhập liệu trong ô input / textarea
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
  if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      isPlaying ? pauseTrack() : playTrack();
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
   4. LINH THỨC DÒ TÌM (TÌM KIẾM PLAYLIST)
========================================================= */
searchInput.addEventListener("input", (e) => {
  renderPlaylist(e.target.value);
});

/* =========================================================
   5. AUDIO VISUALIZER (SÓNG LINH KHÍ QUANH ĐĨA)
========================================================= */
const vCanvas = document.getElementById("visualizer-canvas");
const vCtx = vCanvas.getContext("2d");
let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;

function setupAudioContext() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    drawVisualizer();
  } catch (err) {
    console.log("AudioContext hạn chế CORS:", err);
  }
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

  const centerX = vCanvas.width / 2;
  const centerY = vCanvas.height / 2;
  const baseRadius = 110;
  const bars = 48;
  const step = (Math.PI * 2) / bars;

  for (let i = 0; i < bars; i++) {
    const val = dataArray[i % dataArray.length] || 0;
    const barHeight = (val / 255) * 38;
    const angle = i * step;

    const x1 = centerX + Math.cos(angle) * baseRadius;
    const y1 = centerY + Math.sin(angle) * baseRadius;
    const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
    const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

    const mood = moodDropdown ? moodDropdown.value : "mood-thanhvan";
    let strokeColor = "rgba(16, 185, 129, 0.85)";
    if (mood === "mood-loantinhhai") strokeColor = "rgba(56, 189, 248, 0.85)";
    if (mood === "mood-dokiep") strokeColor = "rgba(168, 85, 247, 0.9)";

    vCtx.strokeStyle = strokeColor;
    vCtx.lineWidth = 2.5;
    vCtx.lineCap = "round";
    vCtx.beginPath();
    vCtx.moveTo(x1, y1);
    vCtx.lineTo(x2, y2);
    vCtx.stroke();
  }
}

/* =========================================================
   6. HIỆU ỨNG CHUỘT: KIẾM KHÍ TRẢM HƯ KHÔNG
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

window.addEventListener("click", (e) => {
  if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest(".modal-box")) {
    return;
  }
  createSwordSlash(e.clientX, e.clientY);
});

function createSwordSlash(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const length = Math.random() * 80 + 70;
  swordSlashes.push({
    x,
    y,
    angle,
    length,
    life: 1.0,
    speed: 0.04
  });
}

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

/* =========================================================
   7. CẢNH GIỚI ĐỘNG PHỦ & CHUYỂN NỀN CẢNH
========================================================= */
if (moodDropdown) {
  moodDropdown.addEventListener("change", (e) => {
    const selectedMood = e.target.value;
    document.body.classList.remove("mood-thanhvan", "mood-loantinhhai", "mood-dokiep");
    document.body.classList.add(selectedMood);

    if (vCtx) {
      vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
    }
  });
}

setInterval(() => {
  if (moodDropdown && moodDropdown.value === "mood-dokiep" && lightningOverlay && Math.random() > 0.65) {
    lightningOverlay.classList.add("flash");
    setTimeout(() => {
      lightningOverlay.classList.remove("flash");
    }, 120);
  }
}, 4500);

/* =========================================================
   8. NẠP NHẠC TÙY Ý & MODAL
========================================================= */
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
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

/* =========================================================
   9. HẠT LINH KHÍ NỀN (AMBIENT PARTICLES)
========================================================= */
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
    this.y -= this.speedY;
    this.x += this.speedX;
    if (this.y < -10) this.reset();
  }
  draw() {
    const style = getComputedStyle(document.body);
    ctx.fillStyle = style.getPropertyValue("--particle-color").trim() || "rgba(16, 185, 129, 0.7)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array.from({ length: 45 }, () => new QiParticle());

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

// Khởi chạy
initPlayer();
