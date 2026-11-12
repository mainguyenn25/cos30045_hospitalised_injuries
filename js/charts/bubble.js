// Section 4: road users - cases (x) vs % died in hospital (y), size = average days in hospital (road_user.csv)
import { d3, css, fmt, frame, showTip, hideTip, row, pct, ROAD_USERS } from '../common.js';

export function draw(el, data) {
  const m = { top: 64, right: 40, bottom: 52, left: 56 };
  const { g, w, h } = frame(el, 400, m);
  const rows = data.filter(d => ROAD_USERS.includes(d['Road user'])).map(d => ({
    name: d['Road user'], cases: d['Count of cases'], deaths: d['Died_cases'],
    fatal: (100 * d['Died_cases']) / d['Count of cases'], days: d['Bed days'] / d['Count of cases'],
  }));
  const grey = css('--context'), red = css('--death'), surface = css('--surface');

  const x = d3.scaleLinear().domain([0, d3.max(rows, d => d.cases)]).nice().range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.fatal)]).nice().range([h, 0]);
  const r = d3.scaleSqrt().domain([0, 10]).range([0, Math.min(30, w / 16)]);

  g.append('g').attr('class', 'grid').call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(d => `${d}%`))
    .call(s => s.select('.domain').remove());
  g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(w < 480 ? 4 : 6).tickFormat(d => (d ? `${d / 1000}K` : '0')).tickSizeOuter(0));
  g.append('text').attr('class', 'label-2').attr('x', w).attr('y', h + 42).attr('text-anchor', 'end').text('Hospital cases, 2011–2021');
  g.append('text').attr('class', 'label-2').attr('x', 0).attr('y', -18).text('Died in hospital');
  g.append('text').attr('class', 'label-2').attr('x', 0).attr('y', -40).text('Bubble size: average days in hospital');

  const b = g.append('g').selectAll('g').data(rows.sort((a, c) => c.days - a.days)).join('g')
    .attr('transform', d => `translate(${x(d.cases)},${y(d.fatal)})`);
  b.append('circle').attr('r', d => r(d.days)).attr('fill', d => (d.name === 'Pedestrian' ? red : grey))
    .attr('fill-opacity', 0.85).attr('stroke', surface).attr('stroke-width', 2);
  b.append('text').attr('class', d => (d.name === 'Pedestrian' ? 'label-strong' : 'label'))
    .attr('x', d => (x(d.cases) > w * 0.75 ? -(r(d.days) + 6) : r(d.days) + 6))
    .attr('text-anchor', d => (x(d.cases) > w * 0.75 ? 'end' : 'start'))
    .attr('y', 5).text(d => d.name);
  b.append('circle').attr('r', d => Math.max(16, r(d.days) + 4)).attr('fill', 'transparent')
    .on('pointermove', (e, d) => showTip(e, `<strong>${d.name}</strong>` +
      row('Hospital cases', fmt(d.cases)) + row('Died in hospital', `${fmt(d.deaths)} (${pct(d.fatal, 2)})`) +
      row('Average days in hospital', d.days.toFixed(1))))
    .on('pointerleave', hideTip);
}
