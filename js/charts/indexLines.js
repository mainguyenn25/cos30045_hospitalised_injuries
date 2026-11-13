// Section 5: hospitalisations indexed to 2011 = 100 for five road users (year_road_user.csv, long format)
import { d3, css, fmt, frame, showTip, hideTip, row, ms, ROAD_USERS } from '../common.js';

const picked = new Set(); // road users picked in the legend; empty = show all

export function draw(el, data) {
  const narrow = el.clientWidth < 560;
  const m = { top: 20, right: narrow ? 24 : 128, bottom: 36, left: 48 };
  const { g, w, h } = frame(el, 380, m);
  const color = Object.fromEntries(ROAD_USERS.map((u, i) => [u, css(`--ru-${i + 1}`)]));
  const series = ROAD_USERS.map(u => {
    const pts = data.filter(d => d['Road user'] === u).sort((a, b) => a['Calendar year'] - b['Calendar year']);
    const base = pts[0].Hospitalisations;
    return { u, pts: pts.map(d => ({ year: d['Calendar year'], n: d.Hospitalisations, idx: (100 * d.Hospitalisations) / base })) };
  });
  const years = series[0].pts.map(p => p.year);

  const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);
  const all = series.flatMap(s => s.pts.map(p => p.idx));
  const y = d3.scaleLinear().domain([Math.min(80, d3.min(all)), d3.max(all)]).nice().range([h, 0]);

  g.append('g').attr('class', 'grid').call(d3.axisLeft(y).ticks(6).tickSize(-w)).call(s => s.select('.domain').remove());
  g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(narrow ? 5 : 11).tickFormat(d3.format('d')).tickSizeOuter(0));
  g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(100)).attr('y2', y(100)).attr('stroke', css('--muted'));
  g.append('line').attr('x1', x(2020)).attr('x2', x(2020)).attr('y1', 0).attr('y2', h).attr('stroke', css('--context'));
  g.append('text').attr('class', 'label-2').attr('x', x(2020) - 6).attr('y', 14).attr('text-anchor', 'end').text('2020');

  const on = u => !picked.size || picked.has(u);
  const op = u => (on(u) ? 1 : 0.15);
  const line = d3.line().x(p => x(p.year)).y(p => y(p.idx));
  const s = g.append('g').selectAll('g').data(series).join('g').attr('opacity', d => op(d.u));
  s.append('path').attr('fill', 'none').attr('stroke', d => color[d.u]).attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round').attr('d', d => line(d.pts));
  s.append('circle').attr('cx', d => x(d.pts.at(-1).year)).attr('cy', d => y(d.pts.at(-1).idx)).attr('r', 4)
    .attr('fill', d => color[d.u]).attr('stroke', css('--surface')).attr('stroke-width', 2);
  if (!narrow) s.append('text').attr('class', 'label').attr('x', w + 10).attr('y', d => y(d.pts.at(-1).idx) + 5)
    .text(d => `${d.u} ${Math.round(d.pts.at(-1).idx)}`);

  // Crosshair tooltip
  const hair = g.append('line').attr('y1', 0).attr('y2', h).attr('stroke', css('--context')).style('display', 'none');
  g.append('rect').attr('width', w).attr('height', h).attr('fill', 'transparent')
    .on('pointermove', e => {
      const yr = Math.round(x.invert(d3.pointer(e)[0]));
      if (!years.includes(yr)) return;
      hair.style('display', null).attr('x1', x(yr)).attr('x2', x(yr));
      const lines = series.map(sr => ({ u: sr.u, p: sr.pts.find(p => p.year === yr) })).sort((a, b) => b.p.idx - a.p.idx);
      showTip(e, `<strong>${yr} (2011 = 100)</strong>` +
        lines.map(l => row(l.u, `${Math.round(l.p.idx)} · ${fmt(l.p.n)}`, color[l.u])).join(''));
    })
    .on('pointerleave', () => { hair.style('display', 'none'); hideTip(); });

  // Legend: pick any number of lines to compare; Reset goes back to all
  const legend = document.querySelector('[data-legend="indexLines"]');
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'reset';
  reset.textContent = 'Reset';
  const buttons = ROAD_USERS.map(u => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="swatch" style="background:${color[u]}"></span>${u}`;
    b.onclick = () => { picked.has(u) ? picked.delete(u) : picked.add(u); update(); };
    return b;
  });
  reset.onclick = () => { picked.clear(); update(); };
  legend.replaceChildren(...buttons, reset);
  // Fade lines in place instead of redrawing, so the change is animated
  function update() {
    s.transition().duration(ms(300)).attr('opacity', d => op(d.u));
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', on(ROAD_USERS[i])));
    reset.disabled = !picked.size;
  }
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', on(ROAD_USERS[i])));
  reset.disabled = !picked.size;
}
