import React, { useRef, useEffect, useState } from 'react';

import { select, min, max, scaleTime, axisBottom, scaleLinear } from 'd3';
// import ResizeObserver from 'resize-observer-polyfill'

const getDate = (dateStr: string) => {
    const date = dateStr.split('-');
    return new Date(+date[2], +date[0] - 1, +date[1]);
};
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
    const [data, setData] = useState([]);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);

    const fetchData = async () => {
        const data = await fetch(`https://www.breakingbadapi.com/api/episodes?series=Breaking+Bad`)
            .then((resp) => resp.ok && resp.json())
            .catch(console.error);

        if (data == null) {
            setData([]);
        }

        setData(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!data) {
            return;
        }
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);

        const minDate = min(data, (ep: any) => getDate(ep.air_date));
        const maxDate = max(data, (ep: any) => getDate(ep.air_date));

        const xScale = scaleTime()
            .domain([minDate || 0, maxDate || 10])
            .range([10, width - 10]);
        const xAxis: any = axisBottom(xScale);

        const yScale = scaleLinear()
            .domain([max(data, (ep: any) => ep.characters.length), 0])
            .range([0, height]);

        svg.select('.x-axis').style('transform', `translateY(${height}px)`).call(xAxis);

        svg.selectAll('.episode')
            .data(data)
            .join('line')
            .attr('class', 'episode')
            .attr('stroke', 'black')
            .style('transform', `translateY(${height}px) scaleY(-1)`)
            .attr('x1', (ep: any) => xScale(getDate(ep.air_date)))
            .attr('x2', (ep: any) => xScale(getDate(ep.air_date)))
            .attr('y2', 0)
            .transition()
            .attr('y1', (ep: any) => yScale(ep.characters.length));
    }, [data, dimensions]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive">
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
        </div>
    );
}
