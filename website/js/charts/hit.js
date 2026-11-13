// What they hit: share of injury cases vs share of deaths by collision partner, per road user (road_user_counterparty.csv)
import { d3, css, fmt, frame, showTip, hideTip, row, pct } from '../common.js';

const USERS = ['Car driver', 'Motorcyclist', 'Pedal cyclist', 'Pedestrian'];
// Fixed order and colours, validated for colour-blind separation; grey "Other" is deliberately neutral.
const HIT = [
  ['Car or van', '--death', '#fff'],
  ['Truck, bus or train', '--ru-1', null],
  ['Fixed object', '--ru-2', null],
  ['Nothing (solo)', '--ru-5', '#fff'],
  ['Other', '--context', null],
];

export function draw(el, data) {
  const barH = 24, gap = 6, groupGap = 26, titleH = 22;
  const groupH = titleH + 2 * barH + gap;
  const m = { top: 4, right: 8, bottom: 4, left: 64 };
  const { g, w } = frame(el, USERS.length * groupH + (USERS.length - 1) * groupGap + m.top + m.bottom, m);
  const ink = css('--ink');
  const color = Object.fromEntries(HIT.map(([k, v, t]) => [k, { fill: css(v), text: t || ink }]));
  el.insertAdjacentHTML('afterbegin', `<div class="key-list" aria-hidden="true">${
    HIT.map(([k]) => `<span><i style="background:${color[k].fill}"></i>${k}</span>`).join('')}</div>`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, w]);
  USERS.forEach((user, i) => {
    const rows = data.filter(d => d['Road user'] === user);
    const gg = g.append('g').attr('transform', `translate(0,${i * (groupH + groupGap)})`);
    gg.append('text').attr('class', 'label-strong').attr('x', -m.left).attr('y', 15).text(user);

    [['Injured', 'Cases %'], ['Died', 'Deaths %']].forEach(([label, pk], j) => {
      const y = titleH + j * (barH + gap);
      gg.append('text').attr('class', 'label-2').attr('x', -10).attr('y', y + barH / 2 + 5).attr('text-anchor', 'end').text(label);
      let x0 = 0;
      for (const [hit] of HIT) {
        const d = rows.find(r => r['What they hit'] === hit);
        if (!d) continue; // pedestrians have no "Fixed object" or "Nothing" rows
        const v = d[pk], x1 = x0 + v;
        const seg = gg.append('g');
        // 2px surface gap between segments
        seg.append('rect').attr('x', x(x0)).attr('y', y).attr('width', Math.max(0, x(x1) - x(x0) - 2)).attr('height', barH)
          .attr('rx', 3).attr('fill', color[hit].fill);
        if (x(x1) - x(x0) > 40) {
          seg.append('text').attr('x', x(x0) + 6).attr('y', y + barH / 2 + 5).attr('font-size', 13)
            .attr('fill', color[hit].text).text(`${Math.round(v)}%`);
        }
        seg.append('rect').attr('x', x(x0)).attr('y', y - gap / 2).attr('width', x(x1) - x(x0)).attr('height', barH + gap)
          .attr('fill', 'transparent')
          .on('pointermove', e => showTip(e, `<strong>${user}: ${hit}</strong>` +
            row(`Share of ${label === 'Died' ? 'deaths' : 'injuries'}`, pct(v), color[hit].fill) +
            row('Hospital cases', fmt(d['Count of cases'])) + row('Died in hospital', fmt(d['Died_cases']))))
          .on('pointerleave', hideTip);
        x0 = x1;
      }
    });
  });
}
