import React, { useRef, useEffect, useState } from 'react';

import { select, hierarchy, tree, linkHorizontal } from 'd3';

function usePrevious(value: any) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

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
const initialData = {
    name: 'test',
    children: [
        {
            name: 'test1',
            children: [
                {
                    name: 'test3',
                },
                {
                    name: 'test4',
                },
            ],
        },
        {
            name: 'test2',
        },
    ],
};

export default function Base() {
    const [initial, setInitial] = useState(false);
    const [data, setData] = useState<
        { name: string; children: { name: string }[] } | { name: string; children?: undefined }
    >(initialData);
    const svgRef: { current: SVGSVGElement | null } = useRef(null);
    const wrapRef: { current: HTMLDivElement | null } = useRef(null);
    const dimensions = useResizeObserver(wrapRef);
    // whenever new data comes, it goes to usePrevious, where it is set to ref.current, but before it sets it
    // it returns the previous ref.current
    // so if the ref.current didnt change, it will be the same
    // if the data does change, it will be different with `previouslyRenderedData`, but only for 1 check
    // so later hen dimension change, it will actually be the same, and you can use that to prevent animations
    const previouslyRenderedData = usePrevious(!initial ? null : data);

    useEffect(() => {
        if (!dimensions) {
            return;
        }
        const { width, height } = dimensions;
        const svg = select(svgRef.current);
        const content = svg.select('.content');

        const root = hierarchy(data); // looks for children by default
        // root.descendants() for drawing dots
        // root.links() for drawing lines

        const linkGenerator = linkHorizontal() // or linkVertical
            .source((link) => link.source) // default
            .target((link) => link.target) // default
            .x((node: any) => node.y) // flipped x with y so tree is horizontal
            .y((node: any) => node.x); // flipped x with y so tree is horizontal

        const treeLayout = tree().size([height, width]); // flipped width with height so tree is horizontal
        treeLayout(root); // tree layout adds the x and y positions for root.descendants()
        // it could be done manually but it is faster with treelayout

        content
            .selectAll('.dot')
            .data(root.descendants())
            .join((enter) => enter.append('circle').attr('opacity', 0))
            .attr('class', 'dot')
            .attr('r', 4)
            .attr('fill', 'black')
            .attr('cx', ({ y }: any) => y) // flipped x with y so tree is horizontal
            .attr('cy', ({ x }: any) => x) // flipped x with y so tree is horizontal
            .transition()
            .duration(500)
            .delay((node) => node.depth * 500)
            .attr('opacity', 1);

        // or
        // content
        //     .selectAll('.dot')
        //     .data(root.descendants())
        //     .join(entry =>
        //         entry
        //             .append('circle')
        //             .attr('cx', ({ y }) => y)
        //             .attr('cy', ({ x }) => x)
        //     )
        //     .attr('class', 'dot')
        //     .attr('r', 4)
        //     .attr('fill', 'black')
        //     .transition()
        //     .attr('cx', ({ y }) => y) // flipped x with y so tree is horizontal
        //     .attr('cy', ({ x }) => x); // flipped x with y so tree is horizontal

        // compare previous data to current to prevent animations on resize
        // links
        const enteringAndUpdatingLinks = svg
            .selectAll('.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', linkGenerator as any)
            .attr('stroke-dasharray', function (this: any) {
                const length = this.getTotalLength();
                return `${length} ${length}`;
            })
            .attr('stroke', 'black')
            .attr('fill', 'none');

        if (data !== previouslyRenderedData) {
            enteringAndUpdatingLinks
                .attr('stroke-dashoffset', function (this: any) {
                    return this.getTotalLength();
                })
                .transition()
                .duration(500)
                .delay((link) => link.source.depth * 500)
                .attr('stroke-dashoffset', 0);
        }

        content
            .selectAll('.label')
            .data(root.descendants())
            .join((enter) => enter.append('text').attr('opacity', 0))
            .attr('class', 'label')
            .text((node) => node.data.name)
            .attr('text-anchor', 'middle')
            .attr('x', ({ y }: any) => y)
            .attr('y', ({ x }: any) => x - 10)
            .transition()
            .duration(500)
            .delay((node) => node.depth * 500)
            .attr('opacity', 1);
        //or
        // content
        //     .selectAll('.label')
        //     .data(root.descendants())
        //     .join(entry =>
        //         entry
        //             .append('text')
        //             .attr('x', ({ y }) => y)
        //             .attr('y', ({ x }) => x - 10)
        //     )
        //     .attr('class', 'label')
        //     .text(node => node.data.name)
        //     .attr('text-anchor', 'middle')
        //     .transition()
        //     .attr('x', ({ y }) => y)
        //     .attr('y', ({ x }) => x - 10);

        if (!initial) setInitial(true);
    }, [data, dimensions, previouslyRenderedData, initial]);
    return (
        <div className="grid-cont-wrap--responsive" ref={wrapRef}>
            <svg ref={svgRef} className="grid-cont--responsive">
                <g className="content"></g>
            </svg>
            <button onClick={() => setData(initialData.children[0])}>Test</button>
        </div>
    );
}
