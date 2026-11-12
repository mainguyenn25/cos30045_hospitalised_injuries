// Section 1: hospitalisations per year (by_year.csv)
import { d3, css, fmt, frame, showTip, hideTip, row } from '../common.js';

export function draw(el, data) {
  const m = { top: 28, right: 64, bottom: 36, left: 52 };
  const { g, w, h } = frame(el, 340, m);
  const Y = 'Calendar year', V = 'Hospitalisations';
  const ink = css('--asphalt');

  const x = d3.scaleLinear().domain(d3.extent(data, d => d[Y])).range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d[V])]).nice().range([h, 0]);

  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(d => (d ? `${d / 1000}K` : '0')))
    .call(s => s.select('.domain').remove());
  g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(w < 480 ? 5 : 11).tickFormat(d3.format('d')).tickSizeOuter(0));

  g.append('path').datum(data).attr('fill', ink).attr('opacity', 0.08)
    .attr('d', d3.area().x(d => x(d[Y])).y0(h).y1(d => y(d[V])));
  g.append('path').datum(data).attr('fill', 'none').attr('stroke', ink).attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round').attr('d', d3.line().x(d => x(d[Y])).y(d => y(d[V])));

  // Annotate the 2020 dip and label the end value
  const d20 = data.find(d => d[Y] === 2020), d19 = data.find(d => d[Y] === 2019), last = data.at(-1);
  if (d20 && d19) {
    const drop = (100 * (d20[V] / d19[V] - 1)).toFixed(1);
    g.append('circle').attr('cx', x(2020)).attr('cy', y(d20[V])).attr('r', 5).attr('fill', ink)
      .attr('stroke', css('--surface')).attr('stroke-width', 2);
    g.append('text').attr('class', 'label-2').attr('x', x(2020)).attr('y', y(d20[V]) + 26)
      .attr('text-anchor', 'end').text(`2020 lockdowns: ${drop}%`);
  }
  g.append('text').attr('class', 'label-strong').attr('x', x(last[Y]) + 8).attr('y', y(last[V]) + 5).text(fmt(last[V]));

  // Crosshair + tooltip
  const hair = g.append('g').style('display', 'none');
  hair.append('line').attr('y1', 0).attr('y2', h).attr('stroke', css('--context'));
  const dot = hair.append('circle').attr('r', 5).attr('fill', ink).attr('stroke', css('--surface')).attr('stroke-width', 2);
  g.append('rect').attr('width', w).attr('height', h).attr('fill', 'transparent')
    .on('pointermove', e => {
      const yr = Math.round(x.invert(d3.pointer(e)[0]));
      const i = data.findIndex(d => d[Y] === yr);
      if (i < 0) return;
      const d = data[i], prev = data[i - 1];
      hair.style('display', null).attr('transform', `translate(${x(yr)},0)`);
      dot.attr('cy', y(d[V]));
      showTip(e, `<strong>${yr}</strong>${row('Hospitalisations', fmt(d[V]))}` +
        (prev ? row('Change on previous year', `${d[V] >= prev[V] ? '+' : ''}${(100 * (d[V] / prev[V] - 1)).toFixed(1)}%`) : ''));
    })
    .on('pointerleave', () => { hair.style('display', 'none'); hideTip(); });
}
