// Used by any project below that has no `video` of its own.
const PLACEHOLDER_VIDEO = 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0';

// Your portfolio. To add real work, edit these entries:
//   video:     YouTube embed (https://www.youtube.com/embed/VIDEO_ID)
//              or Vimeo embed (https://player.vimeo.com/video/VIDEO_ID)
//   thumbnail: path or URL of a still, such as 'images/spot-01.jpg' (replaces `art`)
//   art:       placeholder artwork, 1 to 6
const PROJECTS = {
  commercial: [
    { title: 'Brand Spot 01', format: 'Brand film', duration: '0:30', art: 1 },
    { title: 'Product Launch 01', format: 'Launch film', duration: '1:00', art: 3 },
    { title: 'Campaign Cutdown 01', format: 'Social cutdown', duration: '0:15', art: 5 },
    { title: 'Brand Spot 02', format: 'TV spot', duration: '0:30', art: 2 },
    { title: 'Product Launch 02', format: 'Product demo', duration: '0:45', art: 6 },
    { title: 'Campaign Cutdown 02', format: 'Pre-roll', duration: '0:06', art: 4 },
  ],
  narrative: [
    { title: 'Short Film 01', format: 'Drama', duration: '12:00', art: 5 },
    { title: 'Short Film 02', format: 'Thriller', duration: '8:30', art: 2 },
    { title: 'Music Video 01', format: 'Performance', duration: '3:40', art: 6 },
    { title: 'Short Film 03', format: 'Comedy', duration: '6:15', art: 4 },
    { title: 'Documentary 01', format: 'Mini doc', duration: '10:20', art: 1 },
    { title: 'Scene Cut 01', format: 'Scene study', duration: '2:10', art: 3 },
  ],
  vertical: [
    {
      title: '1',
      format: 'YouTube Short',
      duration: '0:37',
      video: 'https://www.youtube-nocookie.com/embed/ya8OjAhfYRU?rel=0',
      thumbnail: 'https://i.ytimg.com/vi/ya8OjAhfYRU/oar2.jpg',
    },
    {
      title: '2',
      format: 'YouTube Short',
      duration: '0:14',
      video: 'https://www.youtube-nocookie.com/embed/FN65_Uy7Yec?rel=0',
      thumbnail: 'https://i.ytimg.com/vi/FN65_Uy7Yec/oar2.jpg',
    },
    {
      title: '3',
      format: 'YouTube Short',
      duration: '0:20',
      video: 'https://www.youtube-nocookie.com/embed/PruQpjVu2ac?rel=0',
      thumbnail: 'https://i.ytimg.com/vi/PruQpjVu2ac/oar2.jpg',
    },
    {
      title: '4',
      format: 'YouTube Short',
      duration: '0:37',
      video: 'https://www.youtube-nocookie.com/embed/KJC5RUXO8DM?rel=0',
      thumbnail: 'https://i.ytimg.com/vi/KJC5RUXO8DM/oar2.jpg',
    },
  ],
};

const reelSeconds = 60;
const framesPerSecond = 24;

const tabs = [...document.querySelectorAll('.tab')];
const panel = document.getElementById('gallery-panel');
const grid = document.getElementById('gallery-grid');
const player = document.getElementById('player');
const playerTitle = document.getElementById('player-title');
const playerFrame = document.getElementById('player-frame');
const playerClose = document.getElementById('player-close');
const timecode = document.getElementById('timecode');
const scrollProgress = document.getElementById('scroll-progress');
const tracks = document.getElementById('tracks');

function createSpan(className, text) {
  const span = document.createElement('span');
  span.className = className;
  if (text) span.textContent = text;
  return span;
}

function createCard(project, category, index) {
  const item = document.createElement('li');
  item.className = 'gallery-item';
  item.style.setProperty('--index', index);

  const card = document.createElement('button');
  card.className = 'card';
  card.type = 'button';
  card.setAttribute('aria-label', `Play ${project.title}, ${project.format}, ${project.duration}`);
  card.addEventListener('click', () => openPlayer(project, category));

  const thumb = createSpan('thumb');
  if (project.thumbnail) {
    const image = document.createElement('img');
    image.className = 'thumb-art';
    image.src = project.thumbnail;
    image.alt = '';
    image.loading = 'lazy';
    thumb.append(image);
  } else {
    thumb.append(createSpan(`thumb-art art-${project.art}`));
  }
  thumb.append(createSpan('thumb-play'), createSpan('thumb-duration', project.duration));

  card.append(thumb, createSpan('card-title', project.title), createSpan('card-format', project.format));
  item.append(card);
  return item;
}

function selectCategory(tab) {
  const category = tab.dataset.category;

  tabs.forEach((other) => {
    const isActive = other === tab;
    other.setAttribute('aria-selected', String(isActive));
    other.tabIndex = isActive ? 0 : -1;
  });

  panel.setAttribute('aria-labelledby', tab.id);
  grid.dataset.category = category;
  grid.replaceChildren(...PROJECTS[category].map((project, index) => createCard(project, category, index)));
}

function moveTabFocus(event) {
  const lastIndex = tabs.length - 1;
  const currentIndex = tabs.indexOf(event.currentTarget);
  const targets = {
    ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
    ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
    Home: 0,
    End: lastIndex,
  };

  if (!(event.key in targets)) return;
  event.preventDefault();
  const nextTab = tabs[targets[event.key]];
  selectCategory(nextTab);
  nextTab.focus();
}

function openPlayer(project, category) {
  const url = new URL(project.video || PLACEHOLDER_VIDEO);
  url.searchParams.set('autoplay', '1');

  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = project.title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;

  playerTitle.textContent = project.title;
  player.dataset.category = category;
  playerFrame.replaceChildren(iframe);
  player.showModal();
}

// The page acts as a 60-second timeline: scrolling moves the playhead.
function updatePlayhead() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  const totalFrames = Math.round(progress * reelSeconds * framesPerSecond);
  const pad = (value) => String(value).padStart(2, '0');

  const frames = totalFrames % framesPerSecond;
  const totalSeconds = Math.floor(totalFrames / framesPerSecond);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  timecode.textContent = `00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  scrollProgress.style.transform = `scaleX(${progress})`;
}

function revealTracks() {
  tracks.classList.add('will-reveal');
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    tracks.classList.add('is-revealed');
    observer.disconnect();
  }, { threshold: 0.3 });
  observer.observe(tracks);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => selectCategory(tab));
  tab.addEventListener('keydown', moveTabFocus);
});

playerClose.addEventListener('click', () => player.close());
player.addEventListener('click', (event) => {
  if (event.target === player) player.close();
});
// Removing the iframe stops playback when the dialog closes.
player.addEventListener('close', () => playerFrame.replaceChildren());

let playheadQueued = false;
window.addEventListener('scroll', () => {
  if (playheadQueued) return;
  playheadQueued = true;
  requestAnimationFrame(() => {
    updatePlayhead();
    playheadQueued = false;
  });
}, { passive: true });
window.addEventListener('resize', updatePlayhead);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('showreel').play();
}

selectCategory(document.getElementById('tab-vertical'));
updatePlayhead();
revealTracks();
