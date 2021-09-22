import React, { useRef, useEffect, useState } from 'react';

import { select, scaleBand, scaleLinear, max } from 'd3';
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
function useInterval(callback: any, delay: number) {
    const savedCallback: { current: () => void } = useRef(() => null);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const initialData = [
    { name: 'alpha', value: 10, color: '#f4e4df' },
    { name: 'beta', value: 15, color: '#cdcdcd' },
    { name: 'charl', value: 20, color: '#c2b0c9' },
    { name: 'dominic', value: 25, color: '#9556a1' },
    { name: 'camila', value: 30, color: '#fcc164' },
    { name: 'matt', value: 35, color: '#fa6974' },
];

const getRandomIndex = (array: any) => {
    return Math.floor(array.length * Math.random());
};

export default function Base() {
    const [data, setData] = useState(initialData);
    const [iteration, setIteration] = useState(0);
    const [start, setStart] = useState(false);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);

    useInterval(() => {
        if (start) {
            const randomIndex = getRandomIndex(data);
            setData(
                data.map((entry, index) =>
                    index === randomIndex
                        ? {
                              ...entry,
                              value: entry.value + 10,
                          }
                        : entry
                )
            );
            setIteration(iteration + 1);
        }
    }, 500);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);

        const dataCopy = [...data];
        dataCopy.sort((a, b) => b.value - a.value);

        const yScale: any = scaleBand()
            .domain(dataCopy.map((d, i) => '' + i))
            .range([0, height])
            .paddingInner(0.1);

        const xScale: any = scaleLinear()
            .domain([0, max(data, (d) => d.value) || 10])
            .range([0, width]);

        // connecting svg with data connects rects with the indexes of data objects!
        // so if you change order, svg doest know that if you trace by index
        // to make svg trac by something else than index, you have to pass callback to data(data, callback)
        // and tell what to trace with
        // default callback is (entry, index) => index, so if data with id 2 goes to id 0,
        // the first rect will now show data of object that had previously index 2
        // and 3rd rect will show data of the one that was first previously

        // here we want rectangles to stick with the same objects all the time, so if rectangle 1 shows data of 1st obj
        // after data order changes and the 1st object is now like 4th
        // we still want 1st rectangle to show this objects data - so it just chanes place and animates
        svg.selectAll('.bar')
            .data(dataCopy, (entry: any) => entry.name)
            // .join('rect')
            .join((entry) => entry.append('rect').attr('y', (entry, index) => yScale(index))) // we use that so initally these elements to not transition - we pass the y before transition() on first draw
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('height', yScale.bandwidth())
            .attr('fill', (entry) => entry.color)
            .transition()
            .attr('width', (entry) => xScale(entry.value))
            .attr('y', (entry, index) => yScale('' + index));

        // draw labels

        svg.selectAll('.label')
            .data(dataCopy, (entry: any) => entry.name)
            // .join('text')
            .join((entry) =>
                entry.append('text').attr('y', (entry, index) => yScale('' + index) + 5 + yScale.bandwidth() / 2)
            ) // we use that so initally these elements to not transition - we pass the y before transition() on first draw
            .text((entry) => `... ${entry.name} - ${entry.value} meters`)
            .attr('x', 20)
            .attr('class', 'label')
            .transition()
            .attr('y', (entry, index) => yScale('' + index) + 5 + yScale.bandwidth() / 2);
    }, [data, dimensions]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive"></svg>
            <button onClick={() => setStart(!start)}>{start ? 'Stop' : 'Start'}</button>
        </div>
    );
}
