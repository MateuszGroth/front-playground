import React, { useRef, useEffect, useState, useMemo, MutableRefObject } from 'react'

import classnames from 'classnames'

import { select, axisBottom, axisLeft, scaleLinear, scaleBand, zoom, zoomTransform, drag } from 'd3'
import useResizeObserver from '../../hooks/useResizeObserver'
// todo: fix this
import {
  getGraphWidth,
  getGraphMinXAxisTicks,
  removeEmptyTicks,
  calculateMaxYScale,
  getXScaleDomain,
  moveYAxisValuesOnTopOfGridLines,
  removeYAxisVerticalLine,
  setBarFill,
  styleTooltip,
  moveXAxisLabels,
  getYTicks,
} from './helper'

interface BarData {
  label: string
}
const BarChartIcon = () => <></>
const isDarkMode = false

const roundedCornersOffset = 10
const letterWidth = 7.5
const defaultMargin = { top: 15, bottom: 35, left: 30, right: 0 }
const scrollBarData = {
  isActive: false,
  isHover: false,
  thumbBg: isDarkMode ? '#6c6c6c' : '#c1c1c1',
  bg: isDarkMode ? '#151515' : '#f1f1f1',
  activeBg: isDarkMode ? '#494a4e' : '#e6e6e6',
  hoverThumbBg: isDarkMode ? '#7b7f8e' : '#3450a2',
  activeThumbBg: isDarkMode ? '#8ecaff' : '#014489',
  height: 7,
}
const tooltipData = {
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 10,
  paddingRight: 10,
  width: 150,
  fontSize: 14,
  bg: isDarkMode ? '#2c2d30' : '#ffffff',
  borderColor: isDarkMode ? '#6c6c6c' : '#3450a2',
}

const BarChart = (props: any) => {
  const {
    data = [],
    barWidth,
    unit,
    thresholdList,
    isGradient,
    showThreshold,
    valueLabel = 'Value',
    className,
    tooltipLabel,
  } = props
  const [currentZoomState, setCurrentZoomState] = useState<{ x: number; y: number }>()
  const svgRef = useRef()
  const visibleTooltipKeyRef = useRef()
  const wrapRef: MutableRefObject<HTMLElement | undefined> = useRef<HTMLElement | undefined>()
  const dimensions = useResizeObserver(wrapRef as any)

  const margin = useMemo(() => {
    const margin = { ...defaultMargin }
    if (!data.length) {
      margin.bottom = 10
    }
    return margin
  }, [data])

  const gridData = useMemo(() => {
    const contentX = margin.left || 0
    const contentY = margin.top || 0
    const contentWidth = dimensions ? dimensions.width - (margin.right || 0) - (margin.left || 0) : 0
    const contentHeight = dimensions ? dimensions.height - (margin.bottom || 0) - (margin.top || 0) : 0

    const xAxisX = margin.left || 0
    const xAxisY = dimensions ? dimensions.height - (margin.bottom || 0) - (margin.top || 0) : 0
    const xAxisWidth = dimensions ? dimensions.width - (margin.right || 0) - (margin.left || 0) : 0
    const xAxisHeight = 100

    const yAxisX = 0
    const yAxisY = 0
    const yAxisWidth = dimensions ? dimensions.width - (margin.right || 0) : 0
    const yAxisHeight = dimensions ? dimensions.height : 0

    return {
      contentX,
      contentY,
      contentWidth,
      contentHeight,
      xAxisX,
      xAxisY,
      xAxisWidth,
      xAxisHeight,
      yAxisX,
      yAxisY,
      yAxisWidth,
      yAxisHeight,
    }
  }, [dimensions, margin])

  useEffect(() => {
    if (!Array.isArray(data) || !dimensions) {
      return
    }

    const { width: svgWidth, height } = dimensions
    if (svgWidth === 0 || height === 0) {
      return
    }
    const svg = select(svgRef.current as any)
    const content = svg.select('.content')

    // increase content width in case bars require more space
    const innerPadding = 0.6
    const outerPadding = 0.4
    const width = getGraphWidth(data, svgWidth, margin, barWidth, innerPadding, outerPadding)

    // set min ticks in case there are not enough bars to fit the width
    // otherwise bars would stretch and try to occupy the entire space
    const minTicks = data.length
      ? getGraphMinXAxisTicks(width, svgWidth, margin, barWidth, innerPadding, outerPadding)
      : 0

    const xScale = scaleBand()
      .domain(getXScaleDomain(data, minTicks))
      .range([0 + margin.left, width - margin.right])
      .paddingOuter(outerPadding)
      .paddingInner(innerPadding)

    if (currentZoomState && width > svgWidth) {
      // if the chart view is moved so the end of it is already displayed, modify the currentZoomState x so the view is not moved any further
      const transformScaleBy = svgWidth - currentZoomState.x >= width ? -(width - svgWidth) : currentZoomState.x
      xScale.range([0 + margin.left, width - margin.right].map((d) => (d += transformScaleBy)))
      const zoomState = zoomTransform(svg.node())
      if (zoomState && zoomState.x !== transformScaleBy) {
        zoomState.applyX(transformScaleBy)
      }
    }

    const yScale = scaleLinear()
      .domain([0, calculateMaxYScale(data)])
      .nice()
      .range([height - margin.bottom, margin.top])

    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisLeft(yScale)
      .tickSizeOuter(0)
      .ticks(getYTicks(height))
      .tickSize(width - margin.right)
      .tickFormat((val: any) => (unit ? `${val} ${unit}` : val))

    const xAxisEl = svg
      .select('.bar__x-axis')
      .style('transform', `translateY(${height - margin.bottom}px)`)
      .transition()
      .call(xAxis)
      .call(moveXAxisLabels)

    if (data.length < minTicks) {
      removeEmptyTicks(xAxisEl)
    }

    // .tickSize(-height+margin.top+margin.bottom)
    svg
      .select('.bar__y-axis')
      .style('transform', `translateX(${width - margin.right}px)`)
      .call(yAxis)
      .call(removeYAxisVerticalLine)
      .call(moveYAxisValuesOnTopOfGridLines(letterWidth, unit))

    const getTooltipLeft = (barData: BarData) => {
      let tmpTooltipLeft = (xScale(barData.label) ?? 0) + xScale.bandwidth() / 2 - tooltipData.width / 2
      const leftEdge = 1
      const rightEdge = svgWidth - margin.right - 1
      if (tmpTooltipLeft < leftEdge) {
        return leftEdge
      }
      if (tmpTooltipLeft + tooltipData.width > rightEdge) {
        return Math.round(rightEdge - tooltipData.width)
      }
      return Math.round(tmpTooltipLeft)
    }

    const moveHorizChartBy = (moveBy = 0) => {
      if (!moveBy) {
        return
      }

      const zoomState = zoomTransform(svg.node())
      const oldXValue = zoomState.x
      const xThreshold = -(width - svgWidth)

      if (zoomState.x + moveBy <= xThreshold) {
        // on right edge
        zoomState.applyX(xThreshold)
      } else if (zoomState.x + moveBy >= 0) {
        // on left edge
        zoomState.applyX(0)
      } else {
        zoomState.applyX(moveBy)
      }

      if (oldXValue === zoomState.x) {
        // not moved
        return
      }

      xScale.range([0 + margin.left, width - margin.right].map((d) => (d += zoomState.x)))
      const scaledBarWidth = xScale.bandwidth()
      svg
        .selectAll('.bar')
        .transition()
        .duration(200)
        .attr('x', (barData: BarData) => xScale(barData.label))
        .attr('width', scaledBarWidth)

      svg
        .selectAll('.bar__scroll-thumb')
        .transition()
        .duration(200)
        .style('transform', `translateX(${scrollFactor * -zoomState.x}px)`)

      svg
        .selectAll('.bar-tooltip')
        .transition()
        .duration(200)
        .style('transform', (barData: BarData) => `translateX(${getTooltipLeft(barData)}px)`)

      if (showThreshold) {
        svg
          .selectAll('.bar-threshold')
          .transition()
          .duration(200)
          .attr('x', (barData: BarData) => xScale(barData.label) - scaledBarWidth / 4)
          .attr('width', scaledBarWidth * 1.5)
        svg
          .selectAll('.bar-threshold-hover-anchor')
          .transition()
          .duration(200)
          .attr('x', (barData: BarData) => xScale(barData.label) - scaledBarWidth / 4)
          .attr('width', scaledBarWidth * 1.5)
      }

      const xAxisEl = svg.selectAll('.bar__x-axis').transition().duration(200).call(xAxis).call(moveXAxisLabels)
      if (data.length < minTicks) {
        removeEmptyTicks(xAxisEl)
      }
      setCurrentZoomState(zoomState)
    }

    const displayTooltip = (barData: BarData, isFocusEvent = false) => {
      const isScrollVisible = svgWidth !== width
      if (isFocusEvent && isScrollVisible) {
        // move focused bar into the view in case there is a scroll visible
        let moveBy = 0

        const barXScale = xScale(barData.label)
        const offset = barWidth * 1.5
        if (barXScale < 0) {
          moveBy = -1 * barXScale + offset
        } else if (barXScale > svgWidth) {
          moveBy = svgWidth - barXScale - offset
        }

        moveHorizChartBy(moveBy)
      }

      const tooltipLeft = getTooltipLeft(barData)
      svg
        .selectAll('.bar-tooltip')
        .data([{ ...barData, tooltipLeft: 0 }])
        .join((entry) => entry.append('g').attr('opacity', '0').style('transform', `translate(${tooltipLeft}px, 5px)`))
        .attr('class', 'bar-tooltip')
        .each((barData, idx, [tooltip]) => {
          visibleTooltipKeyRef.current = barData.label
          const tooltipGroup = select(tooltip)
          const getTextYOffset = (rowId) => {
            return (
              tooltipData.fontSize + tooltipData.paddingTop + (tooltipData.fontSize + tooltipData.paddingTop) * rowId
            )
          }

          const tooltipHeight = getTextYOffset(2) + tooltipData.paddingBottom + 5

          let tmpTooltipTop = yScale(barData.value) - tooltipHeight - 5
          const topEdge = margin.top + 5
          const tooltipTop = tmpTooltipTop < topEdge ? topEdge : tmpTooltipTop

          tooltipGroup
            .append('rect')
            .attr('class', 'bar-tooltip-bg')
            .attr('width', tooltipData.width)
            .attr('height', tooltipHeight)
            .attr('x', 0)
            .attr('y', tooltipTop)

          const tmpTooltipLabel =
            typeof tooltipLabel === 'function'
              ? tooltipLabel(barData)
              : tooltipLabel == null
              ? barData.label
              : tooltipLabel
          tooltipGroup
            .append('text')
            .text(tmpTooltipLabel)
            .attr('class', 'bar-tooltip-label')
            .attr('text-anchor', 'start')
            .attr('x', tooltipData.paddingLeft)
            .attr('y', tooltipTop + getTextYOffset(0))

          tooltipGroup
            .append('text')
            .text(`${valueLabel} : `)
            .attr('class', 'bar-tooltip-value-label')
            .attr('text-anchor', 'start')
            .attr('x', tooltipData.paddingLeft)
            .attr('y', tooltipTop + +getTextYOffset(1))

          const valueSelection = tooltipGroup
            .append('text')
            .text(`${+barData.value.toFixed(2)}` + (unit ? ` ${unit}` : ''))
            .attr('class', 'bar-tooltip-value')
            .attr('text-anchor', 'end')
            .attr('x', tooltipData.width - tooltipData.paddingRight)
            .attr('y', tooltipTop + +getTextYOffset(1))

          if (barData.fontColor) {
            valueSelection.style('fill', barData.fontColor)
          }

          if (showThreshold) {
            tooltipGroup
              .append('text')
              .text(`Threshold : `)
              .attr('class', 'bar-tooltip-value-label')
              .attr('text-anchor', 'start')
              .attr('x', tooltipData.paddingLeft)
              .attr('y', tooltipTop + +getTextYOffset(2))

            tooltipGroup
              .append('text')
              .text(`${+barData.threshold.toFixed(2)}` + (unit ? ` ${unit}` : ''))
              .attr('class', 'bar-tooltip-value')
              .attr('text-anchor', 'end')
              .attr('x', tooltipData.width - tooltipData.paddingRight)
              .attr('y', tooltipTop + +getTextYOffset(2))
          }

          styleTooltip(tooltipGroup, tooltipData, tooltipLeft)
        })
    }

    const hideTooltip = () => {
      visibleTooltipKeyRef.current = null
      svg.selectAll('.bar-group').transition().duration(200).attr('opacity', 1)
      svg.selectAll('.bar-tooltip').remove()
    }

    const tooltipOnHoverBehaviour = (g) =>
      g
        .attr('tabindex', '0')
        .on('focus', (evt, barData) => {
          svg
            .selectAll('.bar-group')
            .attr('opacity', 1)
            .transition()
            .attr('opacity', (bar) => (bar === barData ? '1' : '0.6'))
          displayTooltip(barData, true)
        })
        .on('mouseenter', (evt, barData) => {
          svg
            .selectAll('.bar-group')
            .attr('opacity', 1)
            .transition()
            .attr('opacity', (bar) => (bar === barData ? '1' : '0.6'))
          displayTooltip(barData)
        })
        .on('mouseleave', () => {
          hideTooltip()
        })
        .on('blur', () => {
          hideTooltip()
        })

    content
      .selectAll('.bar-group')
      .data(data, (entry) => entry.label)
      .join('g')
      .attr('class', 'bar-group')
      .each((barData, idx, barGroups) => {
        const barGroup = select(barGroups[idx])
        const scaledBarWidth = xScale.bandwidth()
        const barY = -height + margin.bottom - roundedCornersOffset

        const tooltipHoverAnchorGroup = barGroup
          .selectAll('.bar-tooltip-anchor-grp')
          .data([barData])
          .join('g')
          .attr('class', 'bar-tooltip-anchor-grp')
          .style('cursor', 'pointer')
          .call(tooltipOnHoverBehaviour)

        tooltipHoverAnchorGroup
          .selectAll('.bar')
          .data([barData])
          .join((entry) => entry.append('rect').attr('x', (barData) => xScale(barData.label)))
          .attr('class', 'bar')
          .style('transform', 'scaleY(-1)') // flip bars so transition works from the right side
          .attr('ry', '7')
          .attr('rx', '7')
          .attr('y', barY)
          .attr('width', scaledBarWidth)
          .transition()
          .attr('opacity', 1)
          .attr('x', (barData) => xScale(barData.label))
          .attr('fill', setBarFill(thresholdList, isDarkMode, isGradient))
          // + roundedCornersOffset because bars are starting below 0 px (at - roundedCornersOffset) - to hide the rounded corners
          .attr('height', (barData) => {
            const h = height - margin.bottom - yScale(barData.value) + roundedCornersOffset
            return h < 0 ? 0 : h
          })

        if (showThreshold) {
          const thresholdBarHoverAnchorHeight = 16
          const thresholdBarHeight = 2

          tooltipHoverAnchorGroup
            .selectAll('.bar-threshold-hover-anchor')
            .data([barData])
            .join('rect')
            .attr('class', 'bar-threshold-hover-anchor')
            .attr('y', (barData) => Math.round(yScale(barData.threshold) - thresholdBarHoverAnchorHeight / 2))
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
            .attr('height', thresholdBarHoverAnchorHeight)
            .attr('fill', 'transparent')

          barGroup
            .selectAll('.bar-threshold')
            .data([barData])
            .join('rect')
            .attr('class', 'bar-threshold')
            .style('pointer-events', 'none')
            .attr('y', (barData) => Math.round(yScale(barData.threshold) - thresholdBarHeight / 2))
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
            .attr('height', thresholdBarHeight)
            .attr('fill', isDarkMode ? '#ffffff' : '#212121')
            .attr('ry', '3')
            .attr('rx', '3')

          return
        }
      })
    if (visibleTooltipKeyRef.current) {
      const tooltipBarData = data.find(({ label }) => label === visibleTooltipKeyRef.current)
      if (tooltipBarData) {
        displayTooltip(tooltipBarData)
      } else {
        hideTooltip()
      }
    }

    // if all bars are visible, disable scrolling
    if (width === svgWidth) {
      svg.style('cursor', 'default').on('mousedown', null)
      svg.selectAll('.bar__scroll-group').remove()
      svg.selectAll('.bar__mouse-wheel-anch-grp').on('mousewheel', null)
      // reset zoom state, behaviour
      const zoomBehavior = zoom().on('zoom', null)
      zoomBehavior(svg)
      setCurrentZoomState(null)
      const zoomState = zoomTransform(svg.node())
      zoomState.k = 1
      zoomState.x = 0
      zoomState.y = 0
      return
    }

    svg.style('cursor', 'grab').on('mousedown', () => svg.style('cursor', 'grabbing'))

    const visibleContentWidth = svgWidth - margin.left - margin.right
    const contentWidth = width - margin.left - margin.right
    const scrollFactor = visibleContentWidth / contentWidth

    let preventWheel = false
    const mouseWheelHandler = (selection) => {
      selection.on(
        'mousewheel',
        (() => {
          return (evt) => {
            evt.preventDefault()
            if (preventWheel) {
              return
            }
            preventWheel = true
            setTimeout(() => (preventWheel = false), 200)
            const moveBy = Math.round((-evt.deltaY - evt.deltaX) / 1.2)
            moveHorizChartBy(moveBy)
          }
        })()
      )

      return selection
    }

    svg
      .selectAll('.bar__mouse-wheel-anch')
      .data([data])
      .join('rect')
      .attr('class', 'bar__mouse-wheel-anch')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'transparent')

    // call mouseWheelHandler on bars also - they are above the wheel anch
    mouseWheelHandler(svg.selectAll(`.bar__mouse-wheel-anch-grp`))

    // const extent = [
    //     [margin.left, margin.top],
    //     [width - margin.right, height - margin.top]
    // ];
    svg
      .selectAll('.bar__scroll-group')
      .data([margin])
      .join('g')
      .attr('class', 'bar__scroll-group')
      .each((scrollData, idx, [scroll]) => {
        const scrollGroup = select(scroll)
        const zoomState = zoomTransform(svg.node())
        scrollGroup
          .selectAll('.bar__scroll-bg')
          .data([scrollBarData])
          .join('rect')
          .attr('class', 'bar__scroll-bg')
          .attr('x', margin.left || 0)
          .attr('y', (scrollData) => height - scrollData.height)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('width', visibleContentWidth)
          .attr('fill', (scrollData) => scrollData.bg)
          .attr('height', (scrollData) => scrollData.height)
          .style('cursor', 'default')
        const scrollBg = scrollGroup.select('.bar__scroll-bg')
        scrollGroup
          .selectAll('.bar__scroll-thumb')
          .data([scrollBarData])
          .join('rect')
          .attr('class', 'bar__scroll-thumb')
          .attr('x', margin.left || 0)
          // apply transform from the zoomState
          .style('transform', `translateX(${scrollFactor * -zoomState.x}px)`)
          .attr('y', (scrollData) => height - scrollData.height)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('width', scrollFactor * visibleContentWidth)
          .attr('fill', (scrollData) => scrollData.thumbBg)
          .attr('height', (scrollData) => scrollData.height)
          .style('cursor', 'default')
          .on('mouseenter', function (evt, scrollData) {
            scrollData.isHover = true
            if (scrollData.isActive) {
              return
            }
            select(this).attr('fill', scrollData.hoverThumbBg)
          })
          .on('mousedown', function (evt, scrollData) {
            scrollData.isActive = true
            select(this).attr('fill', scrollData.activeThumbBg)
            scrollBg.attr('fill', scrollData.activeBg)
          })
          .on('mouseleave', function (evt, scrollData) {
            scrollData.isHover = false
            select(this).attr('fill', scrollData.isActive ? scrollData.activeThumbBg : scrollData.thumbBg)
          })
      })

    // scroll drag
    const scrollThumb = svg.select('.bar__scroll-thumb')
    const scrollBg = svg.select('.bar__scroll-bg')
    const dragHandler = drag()
      .on('drag', function (val) {
        const zoomState = zoomTransform(svg.node())
        const oldXValue = zoomState.x
        const reversedScrollFactor = 1 / scrollFactor
        const xThreshold = -(width - svgWidth)
        const moveBy = val.dx * reversedScrollFactor * -1
        if (zoomState.x + moveBy <= xThreshold) {
          zoomState.x = xThreshold
        } else if (zoomState.x + moveBy >= 0) {
          zoomState.x = 0
        } else {
          zoomState.x += moveBy
        }

        if (oldXValue === zoomState.x) {
          return
        }

        xScale.range([0 + margin.left, width - margin.right].map((d) => (d += zoomState.x)))
        const scaledBarWidth = xScale.bandwidth()
        svg
          .selectAll('.bar')
          .attr('x', (barData) => xScale(barData.label))
          .attr('width', scaledBarWidth)

        svg.selectAll('.bar-tooltip').style('transform', (barData) => `translateX(${getTooltipLeft(barData)}px)`)

        svg.selectAll('.bar__scroll-thumb').style('transform', `translateX(${scrollFactor * -zoomState.x}px)`)

        if (showThreshold) {
          svg
            .selectAll('.bar-threshold')
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
          svg
            .selectAll('.bar-threshold-hover-anchor')
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
        }

        const xAxisEl = svg.selectAll('.bar__x-axis').call(xAxis).call(moveXAxisLabels)
        if (data.length < minTicks) {
          removeEmptyTicks(xAxisEl)
        }
        setCurrentZoomState(zoomState)
      })
      .on('end', function () {
        const [scrollData] = scrollThumb.data()
        scrollData.isActive = false
        scrollThumb.attr('fill', scrollData.isHover ? scrollData.hoverThumbBg : scrollData.thumbBg)
        scrollBg.attr('fill', scrollData.bg)
      })
    dragHandler(scrollThumb)

    // zoom
    const zoomBehavior = zoom()
      .scaleExtent([1, 1]) // zomout 0.5 min, 5 zoom in max
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      // .extent(extent)
      .on('zoom', (event) => {
        preventWheel = true
        const zoomState = zoomTransform(svg.node())
        xScale.range([0 + margin.left, width - margin.right].map((d) => event.transform.applyX(d)))
        const scaledBarWidth = xScale.bandwidth()

        svg
          .selectAll('.bar')
          .attr('x', (barData) => xScale(barData.label))
          .attr('width', scaledBarWidth)

        svg.selectAll('.bar__scroll-thumb').style('transform', `translateX(${scrollFactor * -zoomState.x}px)`)

        svg.selectAll('.bar-tooltip').style('transform', (barData) => `translateX(${getTooltipLeft(barData)}px)`)

        if (showThreshold) {
          svg
            .selectAll('.bar-threshold')
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
          svg
            .selectAll('.bar-threshold-hover-anchor')
            .attr('x', (barData) => xScale(barData.label) - scaledBarWidth / 4)
            .attr('width', scaledBarWidth * 1.5)
        }
        const xAxisEl = svg.selectAll('.bar__x-axis').call(xAxis).call(moveXAxisLabels)
        if (data.length < minTicks) {
          removeEmptyTicks(xAxisEl)
        }
        setCurrentZoomState(zoomState)
      })
      .on('end', () => {
        svg.style('cursor', 'grab')
        preventWheel = false
      })

    zoomBehavior(svg)
  }, [data, dimensions])

  return (
    <div
      className={classnames('bar-chart__cont', className, { 'bar-chart--no-data': data.length === 0 })}
      ref={wrapRef}
    >
      {data.length === 0 ? (
        <div className="bar-chart__no-data-cont">
          <BarChartIcon />
          <span>No Data to display</span>
        </div>
      ) : null}

      <svg ref={svgRef} className="bar-chart">
        {dimensions && dimensions.width !== 0 && dimensions.height !== 0 ? (
          <>
            <defs>
              <clipPath id="barClipPath">
                <rect
                  x={gridData.contentX}
                  y={gridData.contentY}
                  width={gridData.contentWidth}
                  height={gridData.contentHeight}
                />
              </clipPath>
              <clipPath id="barXClip">
                <rect
                  x={gridData.xAxisX}
                  y={gridData.xAxisY}
                  width={gridData.xAxisWidth}
                  height={gridData.xAxisHeight}
                />
              </clipPath>
              <clipPath id="barYClip">
                <rect
                  x={gridData.yAxisX}
                  y={gridData.yAxisY}
                  width={gridData.yAxisWidth}
                  height={gridData.yAxisHeight}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#barYClip)">
              <g className="bar__y-axis" />
            </g>
            <g clipPath="url(#barXClip)">
              <g className="bar__x-axis" />
            </g>
            <g className="bar__mouse-wheel-anch-grp">
              <rect className="bar__mouse-wheel-anch" />
              <g className="content" clipPath="url(#barClipPath)" />
            </g>
          </>
        ) : null}
      </svg>
    </div>
  )
}

export default React.memo(BarChart)
