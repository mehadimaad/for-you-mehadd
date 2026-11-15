const V = 'sunflower-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

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
  {id:'am', h:7, m:0, title:'Good morning, Mehad', body:'I love you. Drink a glass of water and have a proper breakfast today. — madii'},
  {id:'how', h:10, m:30, title:'How are you doing?', body:'Tell me how you feel today. I am thinking of you. — madii'},
  {id:'lunch', h:13, m:0, title:'Did you eat?', body:'Please have a proper lunch, and take a quiet moment to pray. — madii'},
  {id:'water', h:16, m:0, title:'Water time', body:'Drink a big glass of water now, and get your hot pad if you need it. — madii'},
  {id:'dinner', h:19, m:30, title:'Did you have dinner?', body:'Please do not skip it. Eat something warm. I love you. — madii'},
  {id:'night', h:21, m:30, title:'Did you pray today?', body:'Rest well tonight. Warm your tummy, drink some water, sleep soft. — madii'}
];
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
      await self.registration.showNotification(sl.title, {body: sl.body, tag: sl.id, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png'});
    }
  }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'sunflower-remind') e.waitUntil(remindNow()); });
