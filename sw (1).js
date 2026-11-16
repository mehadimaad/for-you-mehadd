const V = 'sunflower-v5';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* online: always fetch the newest copy; offline: use the saved one */
    e.respondWith(
      fetch(r).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res; })
        .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
    );
  } else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(V).then(c => c.match(r).then(m => m || fetch(r).then(res => { c.put(r, res.clone()); return res; }))));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});

const SLOTS = [
 {
  "id": "am",
  "h": 7,
  "m": 0,
  "label": "Good morning",
  "title": "Good morning, Mehad",
  "v": [
   "I love you. Start your day with a glass of water and a proper breakfast.",
   "A new day, a new sunflower morning. I'm so proud of you. Drink some water first.",
   "Rise and shine, my sunflower. I'm thinking of you. Be gentle with yourself today.",
   "Good morning! Eat something before anything else today. I love you.",
   "Wishing you the softest morning. You are loved more than you know.",
   "Morning, love. Stretch a little, drink water, and smile for me.",
   "Today is yours. Take it slow, and know I'm right here."
  ]
 },
 {
  "id": "bfast",
  "h": 8,
  "m": 30,
  "label": "Breakfast",
  "title": "Breakfast time",
  "v": [
   "Have you had breakfast? Please eat something warm.",
   "Don't skip breakfast, Mehad. Even something small helps.",
   "A good breakfast makes a good day. Go eat, I'll wait."
  ]
 },
 {
  "id": "water1",
  "h": 10,
  "m": 0,
  "label": "Water",
  "title": "Water time",
  "v": [
   "Drink a big glass of water now.",
   "Sip some water. Your body will thank you.",
   "Water break! A glass now, a glass later."
  ]
 },
 {
  "id": "how",
  "h": 11,
  "m": 0,
  "label": "How are you doing?",
  "title": "How are you doing?",
  "v": [
   "Tell me how you're feeling today. I'm thinking of you.",
   "How's your day going so far? I'd love to hear.",
   "Are you feeling okay? Cramps, mood, anything. Tell me."
  ]
 },
 {
  "id": "lunch",
  "h": 13,
  "m": 0,
  "label": "Lunch",
  "title": "Did you eat lunch?",
  "v": [
   "Please have a proper lunch. Don't wait until you're starving.",
   "Lunch time! Eat something you love.",
   "Have you eaten? Please don't skip lunch."
  ]
 },
 {
  "id": "rest",
  "h": 14,
  "m": 30,
  "label": "A little rest",
  "title": "Take a little rest",
  "v": [
   "Rest your eyes for a few minutes. Breathe slowly.",
   "Warm your hot pad if you need it, and sit back for a bit.",
   "Stretch your shoulders and back. You've been working hard."
  ]
 },
 {
  "id": "water2",
  "h": 15,
  "m": 30,
  "label": "Water again",
  "title": "Water again",
  "v": [
   "Another glass of water, please.",
   "Stay hydrated, Mehad. A glass right now.",
   "Have you been drinking water? Go have a glass."
  ]
 },
 {
  "id": "snack",
  "h": 16,
  "m": 30,
  "label": "Snack",
  "title": "Snack time",
  "v": [
   "Have a little snack. Something sweet maybe.",
   "Hungry? Grab a snack, you deserve it.",
   "A small treat for a good day. Go get one."
  ]
 },
 {
  "id": "love",
  "h": 17,
  "m": 30,
  "label": "Thinking of you",
  "title": "Thinking of you",
  "v": [
   "Just a reminder: I love you, and I'm proud of you.",
   "You are my favourite person. That's all. Smile!",
   "Hard day or easy day, I'm on your side."
  ]
 },
 {
  "id": "dinner",
  "h": 19,
  "m": 0,
  "label": "Dinner",
  "title": "Dinner time",
  "v": [
   "Have you had dinner? Please eat something warm.",
   "Don't skip dinner, love. Eat, then rest.",
   "Time to eat! Tell me what you're having."
  ]
 },
 {
  "id": "pray",
  "h": 20,
  "m": 30,
  "label": "Prayer",
  "title": "Did you pray?",
  "v": [
   "Take a quiet moment to pray today.",
   "Have you prayed? A little calm for the heart.",
   "A moment of prayer and peace, if you haven't yet."
  ]
 },
 {
  "id": "night",
  "h": 22,
  "m": 0,
  "label": "Goodnight",
  "title": "Goodnight, Mehad",
  "v": [
   "Rest well. Warm your tummy, drink water, and sleep soft.",
   "Goodnight, my sunflower. I love you.",
   "Sleep tight. Tomorrow I'll be here again.",
   "Close your eyes. You did enough today."
  ]
 }
];
const dayNum = d => Math.floor(Date.UTC(+d.slice(0,4), +d.slice(4,6) - 1, +d.slice(6,8)) / 864e5);
function omanNow() {
  const o = {};
  new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Muscat', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'})
    .formatToParts(new Date()).forEach(x => { o[x.type] = x.value; });
  return {date: o.year + o.month + o.day, min: (+o.hour) * 60 + (+o.minute)};
}
async function remindNow() {
  const t = omanNow(), store = await caches.open('sunflower-fired');
  for (const sl of SLOTS) {
    const sm = sl.h * 60 + sl.m, key = new Request('./fired/' + t.date + '-' + sl.id);
    if (t.min >= sm && t.min - sm <= 120 && !(await store.match(key))) {
      await store.put(key, new Response('1'));
      await self.registration.showNotification(sl.title, {body: sl.v[dayNum(t.date) % sl.v.length] + ' — madii', tag: sl.id, icon: 'icon-192.png', badge: 'icon-192.png'});
    }
  }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'sunflower-remind') e.waitUntil(remindNow()); });
