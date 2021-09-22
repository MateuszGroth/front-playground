import React, { useRef, useEffect, useState, Fragment } from 'react';

import { select, line, curveCardinal, axisBottom, axisRight, scaleLinear } from 'd3';

export default function Base() {
    const [data, setData] = useState([250, 30, 430, 50, 220, 160, 320, 175, 100]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);

    useEffect(() => {
        const svg = select(svgRef.current);

        const xScale: any = scaleLinear()
            .domain([0, data.length - 1])
            .range([0, 550]);
        const yScale: any = scaleLinear().domain([0, 450]).range([450, 0]);
        const xAxis: any = axisBottom(xScale)
            .ticks(4)
            .tickFormat((id) => `${id} custom`); // only 4 ticks on the axis with custom ticks
        const yAxis: any = axisRight(yScale);

        svg.select('.x-axis').style('transform', 'translateY(450px)').call(xAxis);
        svg.select('.y-axis').style('transform', 'translateX(550px)').call(yAxis);
        // or
        // xAxis(svg.select('.x-axis'))

        const myLine: any = line()
            .x((value, index) => xScale(index))
            .y(yScale)
            .curve(curveCardinal);

        svg.selectAll('.line')
            .data([data])
            .join('path')
            .attr('class', 'line')
            .attr('d', myLine)
            .attr('fill', 'none')
            .attr('stroke', 'red');
    }, [data]);
    return (
        <div>
            <svg ref={svgRef} className="grid-cont">
                <path className="line"></path>
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
            <br />
            <button onClick={() => setData(data.filter((val) => val < 35))}>Filter</button>
            <button onClick={() => setData(data.map((val) => val + 5))}>Update</button>
        </div>
    );
}
