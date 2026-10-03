/* =========================================================
   PHÀM NHÂN THÍNH ÂM CÁC - XỬ LÝ ÂM THANH & TƯƠNG TÁC
========================================================= */

// Danh sách bài hát khởi đầu
let playlist = [
  {
    id: 1,
    title: "Phàm Nhân Tông Môn Khúc",
    artist: "Thanh Vân Tu Sĩ",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Chưởng Thiên Bình Ngưng Khí",
    artist: "Hàn Lập",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Tinh Hải Phiêu Lưu Bi Ký",
    artist: "Loạn Tinh Hải Cổ Tu",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
  }
];

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Truy vấn các phần tử DOM
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
const playlistContainer = document.getElementById("playlist-items");
const themeToggle = document.getElementById("theme-toggle");

// Phần tử Modal
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const addModal = document.getElementById("add-modal");
const tabBtns = document.querySelectorAll(".tab-btn");
const urlForm = document.getElementById("url-form");
const fileForm = document.getElementById("file-form");

/* 1. KHỞI CHẠY & TẢI NHẠC */
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

  updatePlaylistHighlight();
  resetProgress();
}

function renderPlaylist() {
  playlistContainer.innerHTML = "";
  playlist.forEach((track, index) => {
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
}

function updatePlaylistHighlight() {
  const cards = document.querySelectorAll(".song-card");
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === currentIndex);
  });
}

/* 2. ĐIỀU KHIỂN PHÁT NHẠC */
function playTrack() {
  if (playlist.length === 0) return;
  isPlaying = true;
  audio.play().catch(e => console.log("Cần tương tác của người dùng:", e));
  playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  disc.classList.add("spinning");
  magicCircle.classList.add("active");
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
  if (isRepeat) {
    playTrack();
  } else {
    nextTrack();
  }
});

// Tua & Hiển thị tiến trình
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
  audio.volume = e.target.value;
});

function resetProgress() {
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "00:00";
  durationEl.textContent = "00:00";
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}

/* 3. TÍNH NĂNG THÊM NHẠC TÙY Ý */
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

// Nạp nhạc qua Link URL
urlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("url-title").value.trim();
  const artist = document.getElementById("url-artist").value.trim() || "Ẩn Danh Tiên Giả";
  const src = document.getElementById("url-audio").value.trim();
  const cover = document.getElementById("url-cover").value.trim() || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop";

  const newSong = { id: Date.now(), title, artist, src, cover };
  playlist.push(newSong);
  renderPlaylist();
  addModal.classList.remove("open");
  urlForm.reset();

  loadTrack(playlist.length - 1);
  playTrack();
});

// Nạp file MP3 từ thiết bị
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
  renderPlaylist();
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
    if (index === currentIndex) {
      currentIndex = currentIndex % playlist.length;
      loadTrack(currentIndex);
      if (isPlaying) playTrack();
    } else if (index < currentIndex) {
      currentIndex--;
    }
    renderPlaylist();
  }
}

/* 4. CHUYỂN ĐỔI GIAO DIỆN (DARK/LIGHT) */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

/* 5. CANVAS HẠT LINH KHÍ BAY */
const canvas = document.getElementById("ambient-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
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
    this.speedY = Math.random() * 0.8 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    if (this.y < -10) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 40; i++) {
  particles.push(new QiParticle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Chạy hàm khởi động
initPlayer();
