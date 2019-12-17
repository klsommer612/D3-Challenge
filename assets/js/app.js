// Level 1
// set up SVG definitions
var svgWidth = 960;
var svgHeight = 620;

// set up borders in svg
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

// calculate chart height and width
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter element
var chart = d3.select('#scatter')
    .append('div')
    .classed('chart', true);

// append an svg element to the chart 
var svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// append an svg group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// initial parameters; x and y axis
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// function for updating the x-scale variable upon click of label
function xScale(censusData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}
// function for updating y-scale variable upon click of label
function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
            d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
}
// function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    } else if (chosenXAxis === 'income') {
        return `${value}`;
    } else {
        return `${value}`;
    }
}

//retrieve data
d3.csv('./assets/data/data.csv').then(function(censusData) {

    console.log(censusData);

    //Parse data
    censusData.forEach(function(data) {
        // data.obesity = +data.obesity;
        // data.income = +data.income;
        // data.smokes = +data.smokes;
        // data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create linear scales
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    //create x axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append X
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    //append Y
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        //.attr
        .call(leftAxis);

    //append Circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 14)
        .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
        .data(censusData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function(d) { return d.abbr });

    //create a group for the x axis labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');


    //create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Without Healthcare (%)');


    //update the toolTip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis event listener
    xLabelsGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if (value != chosenXAxis) {

                //replace chosen x with a value
                chosenXAxis = value;

                //update x for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                //update x 
                xAxis = renderXAxis(xLinearScale, xAxis);

                //upate circles with a new x value
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text 
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltip
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            }
        });
    //y axis lables event listener
    yLabelsGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if (value != chosenYAxis) {
                //replace chosenY with value  
                chosenYAxis = value;

                //update Y scale
                yLinearScale = yScale(censusData, chosenYAxis);

                //update Y axis 
                yAxis = renderYAxis(yLinearScale, yAxis);

                //Udate CIRCLES with new y
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update TEXT with new Y values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            }
        });
});