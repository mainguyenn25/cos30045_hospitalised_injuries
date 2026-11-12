import { d3, fmt } from './common.js';
import { draw as trend } from './charts/trend.js';
import { draw as pyramid } from './charts/pyramid.js';
import { draw as shares } from './charts/shares.js';
import { draw as bubble } from './charts/bubble.js';
import { draw as indexLines } from './charts/indexLines.js';
import { draw as ageChange } from './charts/ageChange.js';
import { draw as remoteness } from './charts/remoteness.js';

// chart name (data-chart attribute) -> [draw function, CSV file produced by KNIME]
const CHARTS = {
  trend: [trend, 'by_year.csv'],
  pyramid: [pyramid, 'age_sex.csv'],
  shares: [shares, 'age_sex.csv'],
  bubble: [bubble, 'road_user.csv'],
  indexLines: [indexLines, 'year_road_user.csv'],
  ageChange: [ageChange, 'year_age.csv'],
  remoteness: [remoteness, 'remoteness.csv'],
};

const cache = new Map();
const load = file => {
  if (!cache.has(file)) cache.set(file, d3.csv(`data/${file}`, d3.autoType));
  return cache.get(file);
};

function fail(el, file, err) {
  console.error(file, err);
  el.innerHTML = `<p class="error">Data failed to load: ${file}. Serve the site over http (python3 -m http.server) and check the file is in data/.</p>`;
}

for (const el of document.querySelectorAll('[data-chart]')) {
  const [draw, file] = CHARTS[el.dataset.chart];
  load(file).then(data => {
    const render = () => draw(el, data);
    el.render = render;
    render();
    let lastWidth = el.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - lastWidth) > 4) { lastWidth = el.clientWidth; render(); }
    }).observe(el);
  }).catch(err => fail(el, file, err));
}

// Hero figures come from the same yearly file as the trend chart.
load('by_year.csv').then(rows => {
  const sum = k => d3.sum(rows, d => d[k]);
  const set = (k, v) => { document.querySelector(`[data-stat="${k}"]`).textContent = v; };
  set('hosp', fmt(sum('Hospitalisations')));
  set('died', fmt(sum('Died_cases')));
  set('survival', `${(100 - (100 * sum('Died_cases')) / sum('Count of cases')).toFixed(1)}%`);
  set('bed', `${(sum('Bed days') / 1e6).toFixed(1)} million`);
}).catch(() => {}); // the HTML already holds the published figures

// Cases / bed days toggle for the pyramid
for (const btn of document.querySelectorAll('[data-measure]')) {
  btn.addEventListener('click', () => {
    const fig = document.querySelector('[data-chart="pyramid"]');
    fig.dataset.measure = btn.dataset.measure;
    btn.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    fig.render?.();
  });
}
