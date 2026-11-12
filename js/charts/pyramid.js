// Section 2: age x sex pyramid (age_sex.csv, the KNIME Pivot output). Measure set by the toggle in main.js.
import { d3, css, fmt, frame, hbar, showTip, hideTip, row, AGES } from '../common.js';

export function draw(el, data) {
  const measure = el.dataset.measure || 'Count of cases';
  const narrow = el.clientWidth < 560;
  const m = { top: 40, right: narrow ? 44 : 64, bottom: 12, left: narrow ? 44 : 64 };
  const { g, w, h } = frame(el, 360, m);
  const gap = 64, half = (w - gap) / 2;
  const rows = [...AGES].reverse().map(a => data.find(d => d['Age group'] === a)).filter(Boolean);
  const val = (d, s) => d[`${s}+${measure}`];
  const max = d3.max(rows, d => Math.max(val(d, 'Male'), val(d, 'Female')));

  const y = d3.scaleBand().domain(rows.map(d => d['Age group'])).range([0, h]).padding(0.25);
  const len = d3.scaleLinear().domain([0, max]).range([0, half]);
  const bh = Math.min(24, y.bandwidth());
  const sides = [
    { s: 'Male', base: half, dir: -1, color: css('--male') },
    { s: 'Female', base: half + gap, dir: 1, color: css('--female') },
  ];
  const short = v => (v >= 1e4 ? `${Math.round(v / 1000)}K` : fmt(v));

  for (const { s, base, dir, color } of sides) {
    // Side heading doubles as the legend
    g.append('rect').attr('x', dir < 0 ? base - 64 : base).attr('y', -30).attr('width', 14).attr('height', 4).attr('rx', 2).attr('fill', color);
    g.append('text').attr('class', 'label-strong').attr('x', dir < 0 ? base - 44 : base + 20).attr('y', -24).text(s);

    const bars = g.append('g').selectAll('g').data(rows).join('g');
    bars.append('path').attr('fill', color)
      .attr('d', d => hbar(base, base + dir * len(val(d, s)), y(d['Age group']) + (y.bandwidth() - bh) / 2, bh));
    bars.append('text').attr('class', 'label-2')
      .attr('x', d => base + dir * (len(val(d, s)) + 6))
      .attr('y', d => y(d['Age group']) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', dir < 0 ? 'end' : 'start')
      .text(d => short(val(d, s)));
  }

  // Age labels in the centre gap, plus a full-width hover target per row
  const hit = g.append('g').selectAll('g').data(rows).join('g');
  hit.append('text').attr('class', 'label').attr('text-anchor', 'middle')
    .attr('x', half + gap / 2).attr('y', d => y(d['Age group']) + y.bandwidth() / 2 + 5).text(d => d['Age group']);
  hit.append('rect').attr('x', -m.left).attr('width', w + m.left + m.right)
    .attr('y', d => y(d['Age group'])).attr('height', y.bandwidth()).attr('fill', 'transparent')
    .on('pointermove', (e, d) => {
      const mv = val(d, 'Male'), fv = val(d, 'Female');
      showTip(e, `<strong>Age ${d['Age group']}</strong>` +
        row('Male', fmt(mv), css('--male')) + row('Female', fmt(fv), css('--female')) +
        row('Men per woman', (mv / fv).toFixed(2)));
    })
    .on('pointerleave', hideTip);
}
