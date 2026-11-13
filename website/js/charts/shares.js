// Section 3: each age group's share of cases vs share of in-hospital deaths (age_sex.csv), dumbbell plot
import { d3, css, fmt, frame, showTip, hideTip, row, pct, AGES } from '../common.js';

export function draw(el, data) {
  const m = { top: 44, right: 56, bottom: 36, left: 56 };
  const { g, w, h } = frame(el, 360, m);
  const both = (d, k) => d[`Female+${k}`] + d[`Male+${k}`];
  const totC = d3.sum(data, d => both(d, 'Count of cases')), totD = d3.sum(data, d => both(d, 'Died_cases'));
  const rows = [...AGES].reverse().map(a => data.find(d => d['Age group'] === a)).filter(Boolean).map(d => ({
    age: d['Age group'],
    cases: both(d, 'Count of cases'), deaths: both(d, 'Died_cases'),
    sc: (100 * both(d, 'Count of cases')) / totC, sd: (100 * both(d, 'Died_cases')) / totD,
  }));
  const grey = css('--context'), red = css('--death'), surface = css('--surface');

  const x = d3.scaleLinear().domain([0, d3.max(rows, d => Math.max(d.sc, d.sd))]).nice().range([0, w]);
  const y = d3.scalePoint().domain(rows.map(d => d.age)).range([0, h]).padding(0.5);

  g.append('g').attr('class', 'grid').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(w < 480 ? 4 : 7).tickSize(-h).tickFormat(d => `${d}%`))
    .call(s => s.select('.domain').remove());
  g.append('g').selectAll('text').data(rows).join('text').attr('class', 'label')
    .attr('x', -12).attr('y', d => y(d.age) + 5).attr('text-anchor', 'end').text(d => d.age);

  // Legend
  const lg = g.append('g').attr('transform', 'translate(0,-28)');
  [['Share of hospital cases', grey], ['Share of in-hospital deaths', red]].forEach(([t, c], i) => {
    const gx = i * (w < 480 ? 150 : 220);
    lg.append('circle').attr('cx', gx + 5).attr('cy', 0).attr('r', 5).attr('fill', c);
    lg.append('text').attr('class', 'label-2').attr('x', gx + 16).attr('y', 5).text(w < 480 ? t.replace('Share of ', '').replace('in-hospital ', '') : t);
  });

  const r = g.append('g').selectAll('g').data(rows).join('g').attr('transform', d => `translate(0,${y(d.age)})`);
  r.append('line').attr('x1', d => x(d.sc)).attr('x2', d => x(d.sd)).attr('stroke', grey).attr('stroke-width', 2);
  r.append('circle').attr('cx', d => x(d.sc)).attr('r', 6).attr('fill', grey).attr('stroke', surface).attr('stroke-width', 2);
  r.append('circle').attr('cx', d => x(d.sd)).attr('r', 6).attr('fill', red).attr('stroke', surface).attr('stroke-width', 2);

  // Label only the row the story is about
  const old = r.filter(d => d.age === '75+');
  old.append('text').attr('class', 'label-2').attr('x', d => x(d.sc)).attr('y', -12).attr('text-anchor', 'middle').text(d => pct(d.sc));
  old.append('text').attr('class', 'label-strong').attr('x', d => x(d.sd)).attr('y', -12).attr('text-anchor', 'middle').text(d => pct(d.sd));

  r.append('rect').attr('x', -m.left).attr('width', w + m.left + m.right).attr('y', -y.step() / 2).attr('height', y.step())
    .attr('fill', 'transparent')
    .on('pointermove', (e, d) => showTip(e, `<strong>Age ${d.age}</strong>` +
      row('Share of cases', `${pct(d.sc)} (${fmt(d.cases)})`, grey) +
      row('Share of deaths', `${pct(d.sd)} (${fmt(d.deaths)})`, red) +
      row('Died in hospital', pct((100 * d.deaths) / d.cases, 2))))
    .on('pointerleave', hideTip);
}
