// Shared helpers for every chart. d3 is loaded globally from js/lib/d3.v7.min.js.
export const d3 = window.d3;

export const AGES = ['0-7', '8-16', '17-25', '26-39', '40-64', '65-74', '75+'];
export const ROAD_USERS = ['Car driver', 'Car passenger', 'Motorcyclist', 'Pedal cyclist', 'Pedestrian'];

export const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const fmt = d3.format(',');
export const pct = (v, digits = 1) => `${v.toFixed(digits)}%`;

// Responsive SVG sized to the container's current width (main.js redraws on resize).
export function frame(el, height, margin) {
  el.replaceChildren();
  const width = Math.max(300, el.clientWidth - 16);
  const svg = d3.select(el).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', el.getAttribute('aria-label') || '');
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  return { svg, g, w: width - margin.left - margin.right, h: height - margin.top - margin.bottom, width };
}

// Horizontal bar path from baseline x0 to data end x1: rounded at the data end, square at the baseline.
export function hbar(x0, x1, y, h, r = 4) {
  const len = Math.abs(x1 - x0), rr = Math.min(r, len, h / 2);
  if (len === 0) return '';
  return x1 > x0
    ? `M${x0},${y}H${x1 - rr}A${rr},${rr} 0 0 1 ${x1},${y + rr}V${y + h - rr}A${rr},${rr} 0 0 1 ${x1 - rr},${y + h}H${x0}Z`
    : `M${x0},${y}H${x1 + rr}A${rr},${rr} 0 0 0 ${x1},${y + rr}V${y + h - rr}A${rr},${rr} 0 0 0 ${x1 + rr},${y + h}H${x0}Z`;
}

// One tooltip for the page. html is trusted (built from our own CSV values).
const tip = document.querySelector('.tooltip');
export function showTip(event, html) {
  tip.innerHTML = html;
  tip.hidden = false;
  const pad = 14, r = tip.getBoundingClientRect();
  let x = event.clientX + pad, y = event.clientY + pad;
  if (x + r.width > innerWidth - 8) x = event.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = event.clientY - r.height - pad;
  tip.style.left = `${Math.max(8, x)}px`;
  tip.style.top = `${Math.max(8, y)}px`;
}
export const hideTip = () => { tip.hidden = true; };
export const row = (label, value, color) =>
  `<div class="row"><span>${color ? `<i class="key" style="background:${color}"></i>` : ''}${label}</span><b>${value}</b></div>`;
