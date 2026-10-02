const playlist = [
  {
    title: "Dynamite",
    artist: "BTS (방탄소년단)",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Butter",
    artist: "BTS (방탄소년단)",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Boy With Luv",
    artist: "BTS feat. Halsey",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Spring Day (봄날)",
    artist: "BTS (방탄소년단)",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const albumArt = document.querySelector('.album-art');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const playlistItemsEl = document.getElementById('playlist-items');

let songIndex = 0;
let isPlaying = false;

function loadSong(song) {
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;
  audio.src = song.src;
  updatePlaylistHighlight();
}

function playSong() {
  isPlaying = true;
  albumArt.classList.add('playing');
  playIcon.className = 'fa-solid fa-pause';
  audio.play();
}

function pauseSong() {
  isPlaying = false;
  albumArt.classList.remove('playing');
  playIcon.className = 'fa-solid fa-play';
  audio.pause();
}

playBtn.addEventListener('click', () => {
  isPlaying ? pauseSong() : playSong();
});

function prevSong() {
  songIndex = (songIndex - 1 + playlist.length) % playlist.length;
  loadSong(playlist[songIndex]);
  if (isPlaying) playSong();
}

function nextSong() {
  songIndex = (songIndex + 1) % playlist.length;
  loadSong(playlist[songIndex]);
  if (isPlaying) playSong();
}

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

audio.addEventListener('timeupdate', () => {
  const { duration, currentTime } = audio;
  if (isNaN(duration)) return;

  const percent = (currentTime / duration) * 100;
  progressFill.style.width = `${percent}%`;

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `\({min}:\){sec < 10 ? '0' : ''}${sec}`;
  };

  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

progressBar.addEventListener('click', (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  if (duration) {
    audio.currentTime = (clickX / width) * duration;
  }
});

audio.addEventListener('ended', nextSong);

function renderPlaylist() {
  playlistItemsEl.innerHTML = '';
  playlist.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = `playlist-item ${i === songIndex ? 'active' : ''}`;
    li.innerHTML = `
      \({i + 1}.\){song.title}
      ${song.artist}
    `;
    li.addEventListener('click', () => {
      songIndex = i;
      loadSong(playlist[songIndex]);
      playSong();
    });
    playlistItemsEl.appendChild(li);
  });
}

function updatePlaylistHighlight() {
  const items = document.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    if (index === songIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

renderPlaylist();
loadSong(playlist[songIndex]);