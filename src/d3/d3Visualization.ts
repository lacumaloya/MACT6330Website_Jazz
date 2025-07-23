import * as d3 from 'd3';

export function initD3(): void {
    // Create SVG container
    const svg = d3.select('body')
        .append('svg')
        .attr('width', 400)
        .attr('height', 300)
        .style('position', 'absolute')
        .style('top', '20px')
        .style('right', '20px')
        .style('background-color', 'rgba(255, 255, 255, 0.8)');

    // Sample data
    const data = [12, 5, 6, 6, 9, 10];

    // Create scales
    const xScale = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([0, 400])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data) || 0])
        .range([300, 0]);

    // Create bars
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(i) || 0)
        .attr('y', d => yScale(d))
        .attr('width', xScale.bandwidth())
        .attr('height', d => 300 - yScale(d))
        .attr('fill', '#69b3a2');

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', 'translate(0,300)')
        .call(xAxis);

    svg.append('g')
        .call(yAxis);
} 