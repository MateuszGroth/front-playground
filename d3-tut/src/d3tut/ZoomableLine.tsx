import React, { useRef, useEffect, useState } from 'react';

import { select, line, curveCardinal, axisBottom, axisRight, scaleLinear, max, zoom, zoomTransform } from 'd3';
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

const test = <K extends unknown>(val: K): K => val;

export default function Base() {
    const [data, setData] = useState(Array.from({ length: 50 }, () => Math.round(Math.random() * 100)));
    const [currentZoomState, setCurrentZoomState] = useState<any>();
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current as any);
        const content = svg.select('.content'); // for line so it does not overflow
        const xScale = scaleLinear()
            .domain([0, data.length - 1])
            .range([10, width - 10]);

        if (currentZoomState) {
            const newXScale = currentZoomState.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }

        const yScale: any = scaleLinear()
            // .domain([0, 100])
            .domain([0, max(data) || 10])
            .range([height - 20, 20]);

        const xAxis: any = axisBottom(xScale);
        const yAxis: any = axisRight(yScale);

        svg.select('.x-axis').style('transform', `translateY(${height}px)`).call(xAxis);
        svg.select('.y-axis').style('transform', `translateX(${width}px)`).call(yAxis);
        // or
        // xAxis(svg.select('.x-axis'))

        const myLine: any = line()
            .x((value, index) => xScale(index))
            .y(yScale)
            .curve(curveCardinal);

        content
            .selectAll('.line')
            .data([data])
            .join('path')
            .attr('class', 'line')
            .attr('d', myLine)
            .attr('fill', 'none')
            .attr('stroke', 'red');

        content
            .selectAll('.myDot')
            .data(data)
            .join('circle')
            .attr('class', 'myDot')
            .attr('cx', (v, i) => xScale(i))
            .attr('cy', yScale)
            .attr('r', 5)
            .attr('fill', 'red');

        const zoomBehavior = zoom()
            .scaleExtent([0.5, 5]) // zomout 0.5 min, 5 zoom in max
            .translateExtent([
                [-200, 0],
                [width, height],
            ]) // from point 0 0 to max, max, if was -100 on x value, you could move chart from -100 to max + 100
            .on('zoom', () => {
                const zoomState: any = zoomTransform(svg.node());
                setCurrentZoomState(zoomState);
            });

        zoomBehavior(svg);
    }, [data, dimensions, currentZoomState]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive">
                <defs>
                    <clipPath id="myClipPath">
                        <rect x="0" y="0" width="100%" height="100%" />
                    </clipPath>
                </defs>
                <g className="content" clipPath="url(#myClipPath)" />
                <path className="line"></path>
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
            <br />
            <button onClick={() => setData([...data, Math.round(Math.random() * 100)])}>Add Data</button>
        </div>
    );
}
