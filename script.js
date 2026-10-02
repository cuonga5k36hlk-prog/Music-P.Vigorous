/* ===================================================
   BTS DISCOGRAPHY DATA
   Danh mục các bài hát nổi bật đại diện cho tất cả các thời kỳ BTS
   (Có thể thay đổi đường dẫn "src" thành link file mp3 thật của bạn)
   =================================================== */
const btsTracks = [
  {
    id: 1,
    title: "Spring Day (봄날)",
    album: "You Never Walk Alone",
    category: "ballad",
    duration: "4:34",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Blood Sweat & Tears (피 땀 눈물)",
    album: "WINGS",
    category: "hits",
    duration: "3:37",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Dynamite",
    album: "BE",
    category: "hits",
    duration: "3:19",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Butter",
    album: "Butter Single",
    category: "hits",
    duration: "2:44",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Fake Love",
    album: "Love Yourself: Tear",
    category: "hits",
    duration: "4:02",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Boy With Luv (feat. Halsey)",
    album: "Map of the Soul: Persona",
    category: "hits",
    duration: "3:49",
    cover: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7,
    title: "MIC Drop (Steve Aoki Remix)",
    album: "Love Yourself: Her",
    category: "cypher",
    duration: "3:58",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8,
    title: "Life Goes On",
    album: "BE",
    category: "ballad",
    duration: "3:27",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 9,
    title: "Yet To Come (The Most Beautiful Moment)",
    album: "Proof",
    category: "ballad",
    duration: "3:13",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 10,
    title: "Fire (불타오르네)",
    album: "The Most Beautiful Moment in Life: Young Forever",
    category: "cypher",
    duration: "3:23",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  }
];

/* ===================================================
   DOM ELEMENTS & STATE
   =================================================== */
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let displayedTracks = [...btsTracks];

const audioPlayer = document.getElementById("audioPlayer");
const trackCover = document.getElementById("trackCover");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");
const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");
const volumeSlider = document.getElementById("volumeSlider");
const themeToggle = document.getElementById("themeToggle");
const songList = document.getElementById("songList");
const searchInput = document.getElementById("searchInput");
const filterPills = document.querySelectorAll(".pill");

/* ===================================================
   FUNCTIONS
   =================================================== */

// Hiển thị danh sách bài hát ra giao diện
function renderSongList(tracks) {
  songList.innerHTML = "";
  if (tracks.length === 0) {
    songList.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding:20px;">Không tìm thấy bài hát nào.</p>`;
    return;
  }

  tracks.forEach((track) => {
    const isCurrent = btsTracks[currentTrackIndex].id === track.id;
    const item = document.createElement("div");
    item.className = `song-item ${isCurrent ? "active" : ""}`;
    item.innerHTML = `
      <div class="song-info-meta">
        <img class="song-thumb" src="${track.cover}" alt="${track.title}">
        <div class="song-text">
          <h4>${track.title}</h4>
          <span>${track.album}</span>
        </div>
      </div>
      <span class="song-duration">${track.duration}</span>
    `;

    item.addEventListener("click", () => {
      const realIndex = btsTracks.findIndex((t) => t.id === track.id);
      loadAndPlayTrack(realIndex);
    });

    songList.appendChild(item);
  });
}

// Tải bài hát theo Index
function loadTrack(index) {
  currentTrackIndex = index;
  const track = btsTracks[index];

  trackTitle.textContent = track.title;
  trackArtist.textContent = `BTS • ${track.album}`;
  trackCover.src = track.cover;
  audioPlayer.src = track.src;

  renderSongList(displayedTracks);
}

// Tải & phát ngay
function loadAndPlayTrack(index) {
  loadTrack(index);
  playAudio();
}

// Bật nhạc
function playAudio() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.innerHTML = `<i class="ph-fill ph-pause"></i>`;
    trackCover.classList.add("playing");
  }).catch(() => {
    // Tránh lỗi khi autoplay bị chặn
    isPlaying = false;
  });
}

// Tắt nhạc
function pauseAudio() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.innerHTML = `<i class="ph-fill ph-play"></i>`;
  trackCover.classList.remove("playing");
}

// Chuyển đổi Play/Pause
function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

// Bài tiếp theo
function nextTrack() {
  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * btsTracks.length);
    } while (randomIndex === currentTrackIndex && btsTracks.length > 1);
    currentTrackIndex = randomIndex;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % btsTracks.length;
  }
  loadAndPlayTrack(currentTrackIndex);
}

// Bài trước
function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + btsTracks.length) % btsTracks.length;
  loadAndPlayTrack(currentTrackIndex);
}

// Format giây sang MM:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Cập nhật tiến trình chạy
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  if (!duration) return;
  const progressPercent = (currentTime / duration) * 100;
  progressFill.style.width = `${progressPercent}%`;
  currentTimeEl.textContent = formatTime(currentTime);
  durationTimeEl.textContent = formatTime(duration);
}

// Nhấp chuột vào thanh tiến trình để tua
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  if (duration) {
    audioPlayer.currentTime = (clickX / width) * duration;
  }
}

/* ===================================================
   EVENT LISTENERS
   =================================================== */
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

// Kết thúc bài nhạc
audioPlayer.addEventListener("ended", () => {
  if (isRepeat) {
    audioPlayer.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});

audioPlayer.addEventListener("timeupdate", updateProgress);
progressTrack.addEventListener("click", setProgress);

// Âm lượng
volumeSlider.addEventListener("input", (e) => {
  audioPlayer.volume = e.target.value;
});

// Chế độ Xáo trộn (Shuffle)
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

// Chế độ Lặp lại (Repeat)
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

// Bộ lọc & Tìm kiếm bài hát
function filterAndSearch() {
  const query = searchInput.value.toLowerCase().trim();
  const activePill = document.querySelector(".pill.active");
  const category = activePill ? activePill.dataset.filter : "all";

  displayedTracks = btsTracks.filter((track) => {
    const matchesSearch = track.title.toLowerCase().includes(query) || track.album.toLowerCase().includes(query);
    const matchesCategory = category === "all" || track.category === category;
    return matchesSearch && matchesCategory;
  });

  renderSongList(displayedTracks);
}

searchInput.addEventListener("input", filterAndSearch);

filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    filterPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    filterAndSearch();
  });
});

// Đổi Dark / Light mode
themeToggle.addEventListener("click", () => {
  const body = document.body;
  const isDark = body.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  themeToggle.innerHTML = isDark
    ? `<i class="ph ph-moon"></i>`
    : `<i class="ph ph-sun"></i>`;
});

// Khởi chạy ban đầu
loadTrack(0);
