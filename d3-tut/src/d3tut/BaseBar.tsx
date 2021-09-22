import { useRef, useEffect, useState } from 'react';

import { select, axisBottom, axisRight, scaleLinear, scaleBand } from 'd3';
// import ResizeObserver from 'resize-observer-polyfill'
const useResizeObserver = (ref: any) => {
    const [dimensions, setDimensions] = useState(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries: any) => {
            if (ref.current == null) {
                return;
            }
            setDimensions(entries[0].contentRect);
        });

        resizeObserver.observe(ref.current);
        const refCopy = ref.current;
        return () => {
            if (!refCopy) {
                return;
            }
            resizeObserver.unobserve(refCopy);
        };
    }, [ref]);
    return dimensions;
};

export default function Base() {
    const [data, setData] = useState([250, 30, 430, 50, 220, 160]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);

        const xScale = scaleBand() // scaleBand here spreads given values equally in space, no matter what the values are
            .domain(data.map((val, i) => '' + i))
            // or
            // .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
            .range([0, width])
            .padding(0.5); // to spread bars with bandwidth;
        const yScale = scaleLinear().domain([0, 450]).range([height, 0]);
        // const colorScale = scaleLinear().domain([0, 450]).range(['green', 'red']); // linear color change here
        // const colorScale = scaleLinear().domain([300, 400]).range(['green', 'orange', 'red']).clamp(true); // under 300 - green, between linear, above 400 red
        // without clamp, under 300 would become other color than green (very light green)
        const range: any[] = ['green', 'orange', 'red'];
        const colorScale = scaleLinear().domain([300, 350, 400]).range(range).clamp(true); // under 300 - green, between linear and orange, above 400 red
        // without clamp, under 300 would become other color than green (very light green)
        const xAxis: any = axisBottom(xScale);
        const yAxis: any = axisRight(yScale);

        svg.select('.x-axis').style('transform', `translateY(${height}px)`).call(xAxis);
        svg.select('.y-axis').style('transform', `translateX(${width}px`).call(yAxis);
        // or
        // xAxis(svg.select('.x-axis'))

        svg.selectAll('.bar')
            .data(data)
            .join('rect')
            .attr('class', 'bar')
            .style('transform', 'scaleY(-1)') // flip bars so transition works from the right side
            .attr('x', (value, index) => xScale('' + index) || 0)
            .attr('index', (value, index) => index)
            // .attr('y', yScale)
            .attr('y', -height) // -height here  cuz bars are flipped
            .attr('width', xScale.bandwidth())
            .on('mouseenter', (evt, value) => {
                svg.selectAll('.tooltip')
                    .data([value])
                    .join('text')
                    .attr('class', 'tooltip')
                    .attr('x', xScale(evt.target.getAttribute('index')) || 0 + xScale.bandwidth() / 2)
                    .attr('y', yScale(value) - 4)
                    .text(value)
                    .attr('text-anchor', 'middle')
                    .transition()
                    .attr('y', yScale(value) - 8)
                    .attr('opacity', 1);
            }) // before transition !
            .on('mouseleave', (evt, value) => {
                svg.selectAll('.tooltip').remove();
            }) // before transition !
            .transition() // transition placement is important here - everything after will be transitioned
            .attr('fill', colorScale)
            .attr('height', (value) => height - yScale(value));
    }, [data, dimensions]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive">
                <path className="line"></path>
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
            <br />
            <button onClick={() => setData(data.filter((val) => val < 35))}>Filter</button>
            <br />
            <button onClick={() => setData(data.map((val) => val + 5))}>Update</button>
            <br />
            <button onClick={() => setData([...data, Math.round(Math.random() * 450)])}>Add</button>
        </div>
    );
}
