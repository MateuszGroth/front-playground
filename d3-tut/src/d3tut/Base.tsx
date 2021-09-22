import React, { useRef, useEffect, useState } from 'react';

import { select } from 'd3';

export default function Base() {
    const [data, setData] = useState([25, 30, 45, 60, 20]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);

    useEffect(() => {
        const svg = select(svgRef.current as any);
        svg.selectAll('circle')
            .data(data)
            .join(
                (entry: any) => entry.append('circle'),
                (update: any) => update.attr('class', 'updated'),
                (exit: any) => exit.remove()
            ) // or .join("circle")
            .attr('r', (value) => value)
            .attr('cx', (value) => value * 2)
            .attr('cy', (value) => value * 2)
            .attr('stroke', 'red');
    }, [data]);
    return (
        <div>
            <svg ref={svgRef} className="grid-cont"></svg>
            <br />
            <button onClick={() => setData(data.filter((val) => val < 35))}>Filter</button>
            <button onClick={() => setData(data.map((val) => val + 5))}>Update</button>
        </div>
    );
}
