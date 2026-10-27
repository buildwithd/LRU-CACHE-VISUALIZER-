'use strict';
/* ================= LRU core: HashMap (Map) + Doubly Linked List =================
   Layout: head <-> [MRU] <-> ... <-> [LRU] <-> tail   (head/tail are sentinels)
   Map gives O(1) key -> node lookup; the list keeps recency order.            */
class Node {
  constructor(key, val) { this.key = key; this.val = val; this.prev = null; this.next = null; }
}
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity; this.map = new Map();
    this.head = new Node(); this.tail = new Node();
    this.head.next = this.tail; this.tail.prev = this.head;
    this.hits = 0; this.misses = 0; this.evictions = 0;
  }
  get size() { return this.map.size; }
  unlink(n) { n.prev.next = n.next; n.next.prev = n.prev; }          // O(1) detach
  addFront(n) {                                                      // O(1) insert after head (MRU)
    n.next = this.head.next; n.prev = this.head;
    this.head.next.prev = n; this.head.next = n;
  }
  get(key) {
    const n = this.map.get(key);
    if (!n) { this.misses++; return { hit: false }; }
    this.hits++; this.unlink(n); this.addFront(n);                   // hit: becomes MRU
    return { hit: true, value: n.val };
  }
  put(key, val) {
    const n = this.map.get(key);
    if (n) { n.val = val; this.unlink(n); this.addFront(n); return { type: 'update', evicted: null }; }
    let evicted = null;
    if (this.size >= this.capacity) {                                // full: evict LRU = node before tail
      const lru = this.tail.prev;
      this.unlink(lru); this.map.delete(lru.key); this.evictions++;
      evicted = { key: lru.key, val: lru.val };
    }
    const nn = new Node(key, val); this.map.set(key, nn); this.addFront(nn);
    return { type: 'insert', evicted };
  }
  toArray() {                                                        // MRU -> LRU
    const out = []; for (let n = this.head.next; n !== this.tail; n = n.next) out.push(n); return out;
  }
}

/* ---- Simulations for the analyzer (cache-aside: GET, and PUT on a miss) ---- */
const rateOf = (h, m) => (h + m ? 100 * h / (h + m) : 0);
function simulateLRU(keys, cap) {
  const c = new LRUCache(cap);
  for (const k of keys) if (!c.get(k).hit) c.put(k, k);
  return { hits: c.hits, misses: c.misses, evictions: c.evictions, rate: rateOf(c.hits, c.misses) };
}
// Simplified LFU for comparison only: evict lowest frequency, ties -> least recently used. O(n) eviction.
function simulateLFU(keys, cap) {
  const m = new Map(); let hits = 0, misses = 0, evictions = 0, t = 0;
  for (const k of keys) {
    t++; const e = m.get(k);
    if (e) { hits++; e.f++; e.t = t; continue; }
    misses++;
    if (m.size >= cap) {
      let v = null;
      for (const [key, x] of m) if (!v || x.f < v.x.f || (x.f === v.x.f && x.t < v.x.t)) v = { key, x };
      m.delete(v.key); evictions++;
    }
    m.set(k, { f: 1, t });
  }
  return { hits, misses, evictions, rate: rateOf(hits, misses) };
}

/* ================= UI ================= */
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const DEMO = ['PUT A 1', 'PUT B 2', 'PUT C 3', 'GET A', 'PUT D 4', 'GET B', 'PUT C 30', 'GET D', 'PUT E 5', 'GET A', 'GET C'];
let cache = new LRUCache(3), hist = [], opNo = 0, demoPos = 0, timer = null, lastHl = {}, lastSteps = [];

function say(msg, err) { const m = $('message'); m.textContent = msg; m.className = 'message' + (err ? ' error' : ''); return false; }

function readCapacity() {
  const v = Number($('capInput').value);
  if (!Number.isInteger(v) || v < 1 || v > 12) { say('Capacity must be a whole number from 1 to 12.', true); return null; }
  return v;
}
function resetAll(cap) {
  clearInterval(timer); timer = null; $('runDemo').disabled = false;
  cache = new LRUCache(cap); hist = []; opNo = 0; demoPos = 0; lastHl = {}; lastSteps = [];
  $('capInput').value = cap; say('Cache reset.'); render();
}

function exec(op, key, val) {
  key = key.trim();
  if (!key) return say('Enter a key first.', true);
  let hl = {}, steps, result, tags;
  if (op === 'GET') {
    const r = cache.get(key);
    if (r.hit) {
      hl = { moved: key }; result = r.value; tags = [['Hit', 'good']];
      steps = [`Hash map lookup for "${key}": found, O(1).`, 'Detached its node from the list and re-attached it at the front (MRU).', `Returned "${r.value}". Hits +1.`];
    } else {
      result = 'not found'; tags = [['Miss', 'bad']];
      steps = [`Hash map lookup for "${key}": not found.`, 'Cache is unchanged. Misses +1.'];
    }
  } else {
    val = (val || '').trim();
    if (!val) return say('Enter a value for PUT.', true);
    const r = cache.put(key, val); result = val;
    if (r.type === 'update') {
      hl = { moved: key }; tags = [['Updated', 'good']];
      steps = [`"${key}" already exists in the map.`, `Updated its value to "${val}".`, 'Moved its node to the front (MRU).'];
    } else {
      hl = { inserted: key }; tags = [['Inserted', 'good']];
      steps = [`"${key}" is not in the map: new key.`];
      if (r.evicted) {
        hl.evicted = r.evicted; tags.push([`Evicted ${r.evicted.key}`, 'bad']);
        steps.push(`Cache is full (${cache.capacity}/${cache.capacity}): removed the tail node "${r.evicted.key}" (LRU) from list and map. Evictions +1.`);
      } else steps.push(`Cache has room (${cache.size}/${cache.capacity}): no eviction needed.`);
      steps.push(`Created node "${key}" and inserted it at the front (MRU).`);
    }
  }
  hist.unshift({ n: ++opNo, op, key, result, tags }); if (hist.length > 200) hist.pop();
  lastHl = hl; lastSteps = steps; say(`${op} ${key}: ${tags.map(t => t[0]).join(', ')}.`); render();
  return true;
}

function render() {
  const total = cache.hits + cache.misses;
  $('sCap').textContent = cache.capacity; $('sSize').textContent = cache.size;
  $('sHits').textContent = cache.hits; $('sMiss').textContent = cache.misses; $('sEvict').textContent = cache.evictions;
  $('sRate').textContent = total ? rateOf(cache.hits, cache.misses).toFixed(1) + '%' : '—';

  const chain = $('chain'), nodes = cache.toArray(); chain.replaceChildren();
  nodes.forEach((n, i) => {
    if (i) chain.append(el('span', 'link', '⇄'));
    const d = el('div', 'node' + (lastHl.moved === n.key ? ' moved' : '') + (lastHl.inserted === n.key ? ' inserted' : ''));
    d.append(el('span', 'badge', (i === 0 ? 'MRU' : '') + (i === 0 && i === nodes.length - 1 ? ' / ' : '') + (i === nodes.length - 1 ? 'LRU' : '')),
      el('strong', '', n.key), el('small', '', n.val));
    chain.append(d);
  });
  for (let i = nodes.length; i < cache.capacity; i++) chain.append(el('div', 'node empty'));
  if (lastHl.evicted) {
    const d = el('div', 'node evicted'); d.append(el('span', 'badge', 'evicted'), el('strong', '', lastHl.evicted.key), el('small', '', lastHl.evicted.val));
    chain.append(el('span', 'out', '✕'), d);
  }

  const st = $('steps'); st.replaceChildren();
  (lastSteps.length ? lastSteps : ['Run an operation to see its steps.']).forEach(s => st.append(el('li', '', s)));

  const body = $('histBody'); body.replaceChildren();
  hist.forEach(h => {
    const tr = el('tr'); tr.append(el('td', '', h.n), el('td', '', h.op), el('td', '', h.key), el('td', '', h.result));
    const td = el('td'); h.tags.forEach(t => td.append(el('span', 'tag ' + t[1], t[0]))); tr.append(td); body.append(tr);
  });
  $('histEmpty').hidden = hist.length > 0;

  const dl = $('demoList'); dl.replaceChildren();
  DEMO.forEach((s, i) => dl.append(el('li', i < demoPos ? 'done' : i === demoPos ? 'next' : '', s)));
}

/* ---- Demo ---- */
function stepDemo() {
  if (demoPos >= DEMO.length) { clearInterval(timer); timer = null; $('runDemo').disabled = false; say('Demo finished. Press Run Demo or Reset to start again.'); return false; }
  if (demoPos === 0 && (cache.capacity !== 3 || opNo)) resetAll(3);
  const [op, k, v] = DEMO[demoPos++].split(' '); exec(op, k, v); return true;
}
function runDemo() {
  resetAll(3); $('runDemo').disabled = true;
  timer = setInterval(() => { if (!stepDemo()) { clearInterval(timer); timer = null; $('runDemo').disabled = false; } }, 900);
}

/* ---- Performance analyzer ---- */
const CAPS = [1, 2, 3, 4, 5, 6, 8, 10];
function generateSeq() {            // seeded PRNG (mulberry32) + skew toward early keys: same output every click
  let a = 2024; const rnd = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const out = []; for (let i = 0; i < 60; i++) out.push('ABCDEFGHIJKL'[Math.floor(Math.pow(rnd(), 2) * 12)]);
  $('seq').value = out.join(' ');
}
function drawChart(rows) {
  const svg = $('chart'); svg.replaceChildren();
  const NS = 'http://www.w3.org/2000/svg', W = 600, H = 240, L = 40, T = 12, B = 30, ph = H - T - B;
  const mk = (n, attrs, text) => { const e = document.createElementNS(NS, n); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; svg.append(e); };
  [0, 50, 100].forEach(v => { const y = T + ph * (1 - v / 100); mk('line', { x1: L, x2: W, y1: y, y2: y, class: 'grid' }); mk('text', { x: L - 6, y: y + 4, class: 'axis', 'text-anchor': 'end' }, v + '%'); });
  const gw = (W - L) / rows.length, bw = Math.min(28, gw / 3);
  rows.forEach((r, i) => {
    const cx = L + gw * i + gw / 2;
    [['lru', r.lru.rate, -bw - 1], ['lfu', r.lfu.rate, 1]].forEach(([c, rate, dx]) => {
      const h = ph * rate / 100;
      mk('rect', { x: cx + dx, y: T + ph - h, width: bw, height: h, rx: 3, class: 'bar-' + c });
      mk('text', { x: cx + dx + bw / 2, y: T + ph - h - 4, class: 'val', 'text-anchor': 'middle' }, Math.round(rate));
    });
    mk('text', { x: cx, y: H - 10, class: 'axis', 'text-anchor': 'middle' }, 'cap ' + r.cap);
  });
}
function analyze() {
  const keys = $('seq').value.split(/[\s,]+/).filter(Boolean).slice(0, 5000);
  const caps = [...document.querySelectorAll('#capChecks input:checked')].map(c => Number(c.value));
  const msg = $('perfMsg'); msg.className = 'message error';
  if (!keys.length) { msg.textContent = 'Enter at least one request key, or generate a sample sequence.'; return; }
  if (!caps.length) { msg.textContent = 'Select at least one capacity.'; return; }
  msg.className = 'message'; msg.textContent = `Simulated ${keys.length} requests (${new Set(keys).size} distinct keys) at ${caps.length} capacities.`;
  const rows = caps.map(cap => ({ cap, lru: simulateLRU(keys, cap), lfu: simulateLFU(keys, cap) }));
  const body = $('perfBody'); body.replaceChildren();
  rows.forEach(r => {
    const tr = el('tr'); tr.append(el('td', '', r.cap), el('td', '', r.lru.hits), el('td', '', r.lru.misses), el('td', '', r.lru.evictions),
      el('td', '', r.lru.rate.toFixed(1) + '%'), el('td', '', r.lfu.rate.toFixed(1) + '%')); body.append(tr);
  });
  drawChart(rows);
  const w = rows.filter(r => r.lru.rate > r.lfu.rate + 1e-9).length, l = rows.filter(r => r.lfu.rate > r.lru.rate + 1e-9).length;
  $('compare').textContent = `On this sequence LRU has the higher hit rate at ${w} of ${rows.length} capacities, LFU at ${l}, and they tie at ${rows.length - w - l}. ` +
    'LRU favours recent items; LFU favours frequently used items, so the winner depends on the access pattern.';
}

/* ---- Wiring ---- */
CAPS.forEach(c => {
  const lb = el('label'), cb = el('input'); cb.type = 'checkbox'; cb.value = c; cb.checked = [2, 4, 6, 8].includes(c);
  lb.append(cb, ' ' + c); $('capChecks').append(lb);
});
$('getBtn').onclick = () => { if (exec('GET', $('keyInput').value)) $('keyInput').select(); };
$('putBtn').onclick = () => exec('PUT', $('keyInput').value, $('valInput').value);
$('capBtn').onclick = () => { const c = readCapacity(); if (c) resetAll(c); };
document.querySelectorAll('.reset-btn').forEach(b => b.onclick = () => { const c = readCapacity(); resetAll(c || cache.capacity); });
$('clearHist').onclick = () => { hist = []; render(); };
$('runDemo').onclick = runDemo;
$('stepDemo').onclick = () => { clearInterval(timer); timer = null; $('runDemo').disabled = false; stepDemo(); };
$('analyzeBtn').onclick = analyze;
$('genBtn').onclick = () => { generateSeq(); analyze(); };
['keyInput', 'valInput'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('putBtn').click(); }));
generateSeq(); render(); analyze();
