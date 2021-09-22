import React, { useRef, useEffect, useState } from 'react';

import { select, pie, arc, interpolate, DefaultArcObject } from 'd3';
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
    const [data, setData] = useState([0.1, 0.6]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);

        const arcGenerator = arc().innerRadius(75).outerRadius(150);
        const pieGenerator = pie()
            .startAngle(-0.5 * Math.PI)
            .endAngle(0.5 * Math.PI)
            .sort(null);

        const instructions = pieGenerator(data);
        // or
        // xAxis(svg.select('.x-axis'))

        svg.selectAll('.slice')
            .data(instructions)
            .join('path')
            .attr('class', 'slice')
            .attr('fill', (instr, id) => (id === 0 ? '#ffcc00' : '#eee'))
            .style('transform', `translate(${width / 2}px, ${height / 2}px)`)
            .transition()
            // .attr('d', arcGenerator); // badly animated
            .attrTween('d', function (this: any, nextInstruction) {
                // attrTween so it animates properly
                const interpolator = interpolate(this.lastInstruction, nextInstruction);
                this.lastInstruction = interpolator(1);
                // interpolator called with (0) will return the first argument, here last instruction, and called with (1)
                // will return nextInstruction (2nd arg)
                return function (t: number) {
                    // t is from 0 to 1 - 0 start of the animation and 1 is the end
                    const val: DefaultArcObject = interpolator(t) as unknown as DefaultArcObject;
                    return arcGenerator(val) as string;
                };
            });
    }, [data, dimensions]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive"></svg>
            <button onClick={() => setData([0.5, 0.5])}>Test</button>
        </div>
    );
}
