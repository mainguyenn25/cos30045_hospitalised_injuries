// Section 6: % change in hospitalisations 2011 -> 2021 by age group (year_age.csv, long format)
import { d3, css, fmt, frame, hbar, showTip, hideTip, row, AGES } from '../common.js';

const FIRST = 2011, LAST = 2021, HIGHLIGHT = ['65-74', '75+'];

export function draw(el, data) {
  const m = { top: 12, right: 64, bottom: 36, left: 64 };
  const { g, w, h } = frame(el, 320, m);
  const get = (a, yr) => data.find(d => d['Age group'] === a && d['Calendar year'] === yr)?.Hospitalisations;
  const rows = [...AGES].reverse().map(a => ({ age: a, from: get(a, FIRST), to: get(a, LAST) }))
    .filter(d => d.from && d.to).map(d => ({ ...d, chg: 100 * (d.to / d.from - 1) }));

  const x = d3.scaleLinear().domain([Math.min(-10, d3.min(rows, d => d.chg)), d3.max(rows, d => d.chg)]).nice().range([0, w]);
  const y = d3.scaleBand().domain(rows.map(d => d.age)).range([0, h]).padding(0.3);
  const bh = Math.min(24, y.bandwidth());

  g.append('g').attr('class', 'grid').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(-h).tickFormat(d => `${d > 0 ? '+' : ''}${d}%`))
    .call(s => s.select('.domain').remove());
  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', h).attr('stroke', css('--muted'));

  const r = g.append('g').selectAll('g').data(rows).join('g');
  r.append('path').attr('fill', d => (HIGHLIGHT.includes(d.age) ? css('--asphalt') : css('--context')))
    .attr('d', d => hbar(x(0), x(d.chg), y(d.age) + (y.bandwidth() - bh) / 2, bh));
  r.append('text').attr('class', 'label').attr('x', -12).attr('y', d => y(d.age) + y.bandwidth() / 2 + 5)
    .attr('text-anchor', 'end').text(d => d.age);
  r.append('text').attr('class', d => (HIGHLIGHT.includes(d.age) ? 'label-strong' : 'label-2'))
    .attr('x', d => x(d.chg) + (d.chg >= 0 ? 6 : -6)).attr('y', d => y(d.age) + y.bandwidth() / 2 + 5)
    .attr('text-anchor', d => (d.chg >= 0 ? 'start' : 'end'))
    .text(d => `${d.chg >= 0 ? '+' : ''}${d.chg.toFixed(0)}%`);
  r.append('rect').attr('x', -m.left).attr('width', w + m.left + m.right).attr('y', d => y(d.age)).attr('height', y.bandwidth())
    .attr('fill', 'transparent')
    .on('pointermove', (e, d) => showTip(e, `<strong>Age ${d.age}</strong>` +
      row(String(FIRST), fmt(d.from)) + row(String(LAST), fmt(d.to)) + row('Change', `${d.chg >= 0 ? '+' : ''}${d.chg.toFixed(1)}%`)))
    .on('pointerleave', hideTip);
}
