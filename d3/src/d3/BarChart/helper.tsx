import { max, scaleLinear } from 'd3'

export const getYTicks = (height: number) => (height > 400 ? 6 : 4)
export const getGraphWidth = (data, svgWidth: number, margin, barWidth, innerPadding, outerPadding) => {
  if (data.length < 2 || barWidth == null) {
    return svgWidth
  }
  const { left = 0, right = 0 } = margin
  const numOfBars = data.length
  const spaceForBar = innerPadding === 1 ? barWidth : barWidth / (1 - innerPadding)
  const additionalSpaceForOuterBars = spaceForBar * outerPadding * 2
  const minGraphWidth = (numOfBars - 1) * spaceForBar + additionalSpaceForOuterBars + left + right

  return minGraphWidth > svgWidth ? minGraphWidth : svgWidth
}

export const getGraphMinXAxisTicks = (
  graphWidth,
  svgWidth,
  margin,
  barWidth,
  innerPadding = 0.5,
  outerPadding = 0.5
) => {
  // no need to set min ticks - bars already occupy more space than the svg has
  if (graphWidth > svgWidth) {
    return 0
  }
  // bars will adjust size if their width isnt specified
  if (barWidth == null) {
    return 0
  }

  const { left = 0, right = 0 } = margin

  const spaceForBar = innerPadding === 1 ? barWidth : barWidth / (1 - innerPadding)
  const additionalSpaceForOuterBars = spaceForBar * outerPadding * 2
  // return Math.floor((Math.round((graphWidth - left - right) / barWidth) + 1) / 2);
  // return Math.floor(
  //     (graphWidth - left - right) / (barWidth + 2 * innerPadding * barWidth) +
  //         (innerPadding + outerPadding) / (2 + 4 * innerPadding)
  // );
  try {
    return Math.floor((graphWidth - left - right - additionalSpaceForOuterBars) / spaceForBar) + 1
  } catch (e) {
    return 5
  }
}

export const removeEmptyTicks = (xAxisEl) => {
  return xAxisEl.selectAll('.tick').each(function (this: any, d: any) {
    if (d.startsWith('empty')) {
      this.remove()
    }
  })
}

export const moveXAxisLabels = (g) => g.selectAll('text').attr('y', 13)

export const calculateMaxYScale = (data) => {
  if (!data.length) {
    return 100
  }
  const scaleFactor = 1.1
  const maxYScale = max(data.map(({ threshold, value }) => scaleFactor * (+threshold > +value ? +threshold : +value)))
  return maxYScale < 10 ? 10 : maxYScale
}

export const getXScaleDomain = (data, minTicks) =>
  data.length >= minTicks
    ? data.map((val) => val.label)
    : [...data, ...Array(minTicks - data.length)].map((val, i) => (val ? val.label : `empty_${i}`))

export const removeYAxisVerticalLine = (g) => g.select('.domain').remove()
export const moveYAxisValuesOnTopOfGridLines = (letterWidth, unit) => (g) =>
  g
    .selectAll('text')
    .attr('x', function (val) {
      const numOfLetters = ('' + val).length + (unit ? unit.length + 1 : 0)
      const moveBy = numOfLetters * letterWidth
      return +this.getAttribute('x') + moveBy
    })
    .attr('dy', '-3')

export const setBarFill = (thresholdList, isDarkMode, isGradient) => {
  const colorScale =
    isGradient && Array.isArray(thresholdList)
      ? scaleLinear()
          .domain(thresholdList.map(({ value }) => value))
          .range(thresholdList.map(({ color }) => color))
          .clamp(true)
      : null
  return (barData) => {
    if (barData.fill) {
      return barData.fill
    }

    if (colorScale) {
      return colorScale(+barData.value)
    }

    if (Array.isArray(thresholdList)) {
      for (const threshold of thresholdList) {
        if (barData.value <= threshold.value) {
          return threshold.color
        }
      }
    }

    return isDarkMode ? '#8ecaff' : '#3450a2'
  }
}

export const styleTooltip = (tooltipGroup, tooltipData, tooltipLeft) => {
  tooltipGroup.selectAll('.bar-tooltip-label').style('pointer-events', 'none')
  tooltipGroup.selectAll('.bar-tooltip-value').style('pointer-events', 'none')
  tooltipGroup.selectAll('.bar-tooltip-value-label').style('pointer-events', 'none')

  tooltipGroup
    .selectAll('.bar-tooltip-bg')
    .attr('fill', tooltipData.bg)
    .attr('stroke-width', 1)
    .attr('rx', 2)
    .attr('ry', 2)
    .style('pointer-events', 'none')

  tooltipGroup
    // .attr('opacity', '0')
    // .style('transform', `translate(${tooltipLeft}px, 5px)`)
    .transition()
    .attr('opacity', '1')
    .style('transform', `translate(${tooltipLeft}px, 0px)`)
}
