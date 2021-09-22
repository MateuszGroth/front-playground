import React, { useRef, useEffect, useState } from 'react';

import { select, line, curveCardinal, axisBottom, axisRight, scaleLinear, max, brushX } from 'd3';
// import ResizeObserver from 'resize-observer-polyfill'

function usePrevious(value: any) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

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
    const [data, setData] = useState(Array.from({ length: 50 }, () => Math.round(Math.random() * 100)));
    const [selection, setSelection] = useState<any>([0, 1.5]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);
    const previousSelection = usePrevious(selection);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);
        const content = svg.select('.content'); // for line so it does not overflow
        const xScale = scaleLinear()
            .domain([0, data.length - 1])
            .range([10, width - 10]);

        // you can call xScale/yScale .invert to get reverted data, so from pixels to indexes when it comes to x scale
        // and from pixels to data with yScale

        const yScale: any = scaleLinear()
            // .domain([0, 100])
            .domain([0, max(data) || 0])
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
            .attr('r', (val, index) => (index > selection[0] && index < selection[1] ? 10 : 5))
            .attr('fill', 'red');

        // selection (brush)

        const brush: any = brushX()
            .extent([
                [0, 0],
                [width, height],
            ])
            .on('start brush end', (event) => {
                if (event.selection) {
                    const indexSelection = event.selection.map(xScale.invert);
                    setSelection(indexSelection);
                }
            });
        // .on("brush")
        // .on("end")
        if (previousSelection === selection) {
            // selection is indexes, map to pexels
            svg.select('.selection').call(brush).call(brush.move, selection.map(xScale));
        }
    }, [data, dimensions, selection]);
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
                <g className="selection"></g>
            </svg>
            <br />
            <button onClick={() => setData([...data, Math.round(Math.random() * 100)])}>Add Data</button>
        </div>
    );
}
