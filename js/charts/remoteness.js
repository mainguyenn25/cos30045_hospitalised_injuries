// Section 7: severity by remoteness - two small multiples, never a dual axis (remoteness.csv)
import { d3, css, fmt, frame, hbar, showTip, hideTip, row, pct } from '../common.js';

const AREAS = ['Major Cities', 'Regional', 'Remote'];

export function draw(el, data) {
  const stacked = el.clientWidth < 640;
  const panelH = 150, titleH = 36;
  const m = { top: 8, right: 56, bottom: 8, left: 104 };
  const { g, w } = frame(el, stacked ? 2 * (panelH + titleH) + 24 : panelH + titleH, m);
  const rows = AREAS.map(a => data.find(d => d['ABS remoteness area'] === a)).filter(Boolean).map(d => ({
    area: d['ABS remoteness area'], cases: d['Count of cases'], deaths: d['Died_cases'],
    days: d['Days per case'], fatal: d['Died %'], // both computed in KNIME
  }));
  const panels = [
    { key: 'days', title: 'Average days in hospital', fmt: v => v.toFixed(1), color: css('--asphalt') },
    { key: 'fatal', title: 'Died in hospital', fmt: v => pct(v, 2), color: css('--death') },
  ];
  const gap = 64; // room for panel 1's value labels before panel 2's area labels
  const pw = stacked ? w : (w - m.left - gap) / 2;

  panels.forEach((p, i) => {
    const pg = g.append('g').attr('transform', stacked
      ? `translate(0,${i * (panelH + titleH + 24)})`
      : `translate(${i * (pw + m.left + gap)},0)`);
    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d[p.key])]).nice().range([0, pw]);
    const y = d3.scaleBand().domain(AREAS).range([titleH, titleH + panelH]).padding(0.3);
    const bh = Math.min(24, y.bandwidth());
    pg.append('text').attr('class', 'label-strong').attr('x', -m.left).attr('y', 16).text(p.title);
    const r = pg.selectAll('g').data(rows).join('g');
    r.append('path').attr('fill', d => (d.area === 'Regional' ? p.color : css('--context')))
      .attr('d', d => hbar(0, x(d[p.key]), y(d.area) + (y.bandwidth() - bh) / 2, bh));
    r.append('text').attr('class', 'label').attr('x', -12).attr('y', d => y(d.area) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', 'end').text(d => d.area);
    r.append('text').attr('class', d => (d.area === 'Regional' ? 'label-strong' : 'label-2'))
      .attr('x', d => x(d[p.key]) + 6).attr('y', d => y(d.area) + y.bandwidth() / 2 + 5).text(d => p.fmt(d[p.key]));
    r.append('rect').attr('x', -m.left).attr('width', pw + m.left + 40).attr('y', d => y(d.area)).attr('height', y.bandwidth())
      .attr('fill', 'transparent')
      .on('pointermove', (e, d) => showTip(e, `<strong>${d.area}</strong>` + row('Hospital cases', fmt(d.cases)) +
        row('Died in hospital', `${fmt(d.deaths)} (${pct(d.fatal, 2)})`) + row('Average days in hospital', d.days.toFixed(1))))
      .on('pointerleave', hideTip);
  });
}
