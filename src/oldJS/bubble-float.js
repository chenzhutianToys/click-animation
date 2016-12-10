/* global d3 */
'use strict'


var width = 600,//Math.max(960, innerWidth),
    height = 800;//Math.max(500, innerHeight);


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var format = d3.time.format("%m/%d/%y");
var data = [
    'Group1,30,04/23/12',
    'Group1,32,04/24/12',
    'Group1,30,04/25/12',
    'Group1,24,04/26/12',
    'Group2,12,04/23/12',
    'Group2,19,04/24/12',
    'Group2,16,04/25/12',
    'Group2,12,04/26/12',
    'Group3,20,04/23/12',
    'Group3,20,04/24/12',
    'Group3,20,04/25/12',
    'Group3,20,04/26/12',

].map(function (d) {
    var items = d.split(',');
    return {
        key: items[0],
        date: format.parse(items[2]),
        value: +items[1]
    };
});


var stack = d3.layout.stack()
    .offset("zero")
    .values(function (d) { return d.values; })
    .x(function (d) { return d.date; })
    .y(function (d) { return d.value; });

var nest = d3.nest()
    .key(function (d) { return d.key; });

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function (d) { return x(d.date); })
    .y0(function (d) { return y(d.y0); })
    .y1(function (d) { return y(d.y0 + d.y); });
var overlayArea = d3.svg.area()
    .interpolate("cardinal")
    .x(function (d) { return x(d.date); })
    .y0(function (d) { return y(d.y0 + d.y); })
    .y1(function (d) { return y(d.y0 + d.y); });

var line = d3.svg.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.y0 + d.y); })
    .interpolate("cardinal")
    ;

var layers = stack(nest.entries(data));

var x = d3.time.scale()
    .domain(d3.extent(data, function (d) { return d.date; }))
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.y0 + d.y; })])
    .range([height, 50]);

var z = d3.scale.category10();

var stackAreaBackground = svg.selectAll(".layer-background")
    .data(layers)
    .enter().append("path")
    .attr("class", "layer-background")
    .attr("d", function (d) { return area(d.values); })
    .style("fill", function (d, i) { return z(i); })
    .style("opacity", 0.2)
    ;
var stackAreaOverlay = svg.selectAll(".layer-overlay")
    .data(layers)
    .enter().append("path")
    .attr("id", function (d) { return "layer-overlay_" + d.key; })
    .attr("class", "layer-overlay")
    .attr("d", function (d) { return overlayArea(d.values); })
    .style("fill", function (d, i) { return z(i); })
    ;

var stackLine = svg.selectAll(".layer-bounder")
    .data(layers)
    .enter().append("path")
    .attr("class", "layer-boder")
    .attr('id', function (d) { return "group_" + d.key; })
    .attr("d", function (d) { return line(d.values); })
    .style("fill", "none")
    .style("stroke", function (d, i) { return z(i); })
    .style("stroke-width", 1.5)
    ;

//init boundary
var i, j,
    point, index, dist,
    tPath, tPathLength, roundDist,
    boundary = {};
for (j = 1; j < 4; ++j) {
    tPath = document.getElementById('group_Group' + j);
    tPathLength = Math.floor(tPath.getTotalLength());
    boundary[j] = { pathLength: tPathLength, values: [] };
    roundDist = [];

    for (i = 0; i < tPathLength; ++i) {
        point = tPath.getPointAtLength(i);
        index = Math.round(point.x);
        dist = Math.abs(point.x - index);
        if (roundDist[index]) {
            if (dist < roundDist[index]) {
                roundDist[index] = dist;
                boundary[j]['values'][index] = point.y;
            }
        } else {
            roundDist[index] = dist;
            boundary[j]['values'][index] = point.y;
        }
    }
}

var balls = d3.range(50).map(function (d, i) {
    return {
        'boundary': (i % 3) + 1,
        'r': Math.random() * 10 + 5,
        'color': z(i % 3)
    };
});

var canvas = d3.select("body")
    .append("canvas")
    .attr('class', 'bubble-float')
    .attr("width", width)
    .attr("height", height)
    ;
var context = canvas.node().getContext("2d");

var moveLayout = Engine(balls)
    .friction(4)
    .gravity([0, -Infinity, 9.8])
    .bounds([[0, 0], [width, height]])
    .boundary(boundary)
    .on('tick', function (e) {
        var i = -1,
            ball,
            n = balls.length;
        context.clearRect(0, 0, width, height);

        while (++i < n) {
            ball = balls[i];
            if (ball.fixed) continue;
            context.beginPath();
            context.fillStyle = ball.color;
            context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
            context.fill();
        }
    })
    .on('sed', function (e) {
        overlayArea.y0(function (d) { return y(d.y0 + (1 - 0.08 * e.value) * d.y); })
        var layer = d3.select("#layer-overlay_Group" + e.groupId);
        layer.transition().duration(300).attr("d", function (d) { return overlayArea(d.values); })
        console.log("let's sed");
    })
    ;

moveLayout.start();
setInterval(function () {
    var boundary = (Math.random() > 0.7 ? 3 : Math.random() > 0.6 ? 2 : 1);
    //balls.push();
    moveLayout.addNode({
        'boundary': boundary,
        'r': Math.random() * 10 + 5,
        'color': z(boundary - 1)
    })
}, 100);