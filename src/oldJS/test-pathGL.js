/* global d3 */

var config = {};
config.playrate = 3000;

var gui = new dat.GUI();
gui.add(config, 'playrate', 1000, 4000);

var height = 2000;
var width = window.innerWidth;
var offset = 150;
var svg = d3.select("body").append('svg')
    .attr("width", width + offset * 2)
    .attr("height", height)
    .attr("id", 'chart');

var frame = svg.append('g').attr("class", "frame").attr("transform", "translate(" + offset + "," + offset + ")");

var times = [1374454800000, 1374454800000, 1374454800000, 1374454800000,
    1375059600000, 1375059600000, 1375059600000,
    1375664400000, 1375664400000, 1375664400000, 1375664400000, 1375664400000,
    1376269200000, 1376269200000, 1376269200000, 1376269200000, 1376269200000];

var lengths = [906.0,
    216.0,
    1226.0,
    851.0,
    664.0,
    1196.0,
    882.0,
    470.0,
    810.0,
    373.0,
    713.0,
    402.0,
    539.0,
    902.0,
    746.0,
    571.0,
    297.0];

var videoRealName = [
    'Week-1-1',
    'Week-1-2',
    'Week-1-3',
    'Week-1-4',
    'Week-2-1',
    'Week-2-2',
    'Week-2-3',
    'Week-3-1',
    'Week-3-2',
    'Week-3-3',
    'Week-3-4',
    'Week-3-5',
    'Week-4-1',
    'Week-4-2',
    'Week-4-3',
    'Week-4-4',
    'Week-4-5'
]

var endTime = 1380326400000;

var colors = d3.scale.ordinal()
    .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
    .domain(['seeked', 'pause', 'play', 'stalled', 'ratechange', 'error'])
    ;


//Add legend
var legendWidth = 250;
var legendHeight = offset;
var legendRadius = 15;
var actionTypes = ['play', 'seeked', 'pause', 'stalled', 'error', 'ratechange'];
svg.append('g')
    .attr('class', 'legend')
    .selectAll('.legend-circle')
    .data(actionTypes).enter()
    .append('circle')
    .attr('cx', function (d, i) {
        return offset + i * legendWidth;
    })
    .attr('cy', legendHeight / 2)
    .attr('r', legendRadius)
    .attr('fill', function (d) {
        return colors(d);
    })
    .attr('opacity', 1)
    .attr('class', "legend-circle")
    .attr('filter', 'url(#ball-glow2)');

svg.select('g.legend')
    .selectAll('.legend-text')
    .data(actionTypes).enter()
    .append('text')
    .attr('class', 'legend-text')
    .attr("x", function (d, i) {
        return offset + i * legendWidth + 2 * legendRadius;
    })
    .attr("y", legendHeight / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .attr('fill', function (d) {
        return colors(d);
    })
    .text(function (d, i) {
        return d;
    })
;

//Add video
var videos = [];
for (var i = 0; i < times.length; i++) {
    videos.push({
        'videoID': 'no' + (i * 2 + 3),
        'startTime': times[i],
        'length': lengths[i]
    });
}

var videoNames = {};

videos.forEach(function (d,i) {
    return videoNames[d.videoID] = i;
});
console.log(videoNames);

var eachHeight = 70;
var startOffset = 100;
frame.selectAll('.video-name')
    .data(videoRealName).enter()
    .append('text')
    .attr('class', 'legend-text')
    .attr("x", startOffset - 20)
    .attr("y", function (d, i) {
        return i * eachHeight + eachHeight * 0.8 / 2
    })
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .text(function (d, i) {
        return d;
    })
    .attr('fill', "black")
;


var webgl = d3.select('canvas')
    .attr('class','no-click')
    .attr({
        width:  1500,
        height: eachHeight * (0.4 + videoRealName.length -1)
    })
    .style({
        top:(offset + eachHeight * 0.4)+"px",
        left:offset + "px"
    })
;


d3.json("data/typeCount_noDiff.json", function (data1) {
    var types = data1[0].clicks.map(function (d) {
        return d.type;
    });
    console.log(types);

    var streamData = data1.map(function (d) {
        //
        return d.clicks.map(function (dat) {
            var length = dat.data.length;
            var result = dat.data.slice(2, length - 3).aggregate(5).map(function (dd, i) {
                return {
                    x: i,
                    y: dd
                }
            });
            return result;
        })
    });
    console.log(streamData);
    
    //streamData
    var stack = d3.layout.stack();
    var layers = streamData.map(function (d) {
        return stack(d);
    });

    var x = d3.scale.linear()
        .domain([0, d3.max(layers.map(function (d) {
            return d[0].length - 1;
        }))])
        .range([0, 1226]);

    var y = d3.scale.linear()
        .domain([0, d3.max(layers, function (layer) { return d3.max(layer, function (l) { return d3.max(l, function (d) { return d.y0 + d.y; }); }) })])
        .range([eachHeight, 0]);

    var area = d3.svg.area()
        .x(function (d, i, j) { return startOffset + x(d.x); })
        .y0(function (d, i, j) { return y(d.y0) })
        .y1(function (d, i, j) { return y(d.y0 + d.y) })
        .interpolate('basis');

    frame.selectAll("themeriver")
        .data(layers)
        .enter().append("g").attr('class', 'themeriver')
        .attr('transform', function (d, i) {
            return 'translate(0,' + eachHeight * (i - 0.5) + ')'
        })
        .selectAll('path')
        .data(function (d) { return d }).enter().append('path')
        .attr("d", area)
        .style("fill", function (d, i) { return colors(types[i]); })
        .attr("opacity", 0.5);

    d3.json("data/animation_All17.json", function (data) {
        data.sort(function (a, b) {
            var aV = +a['action']['ts'];
            var bV = +b['action']['ts'];
            if (aV == bV) return 0;
            else if (aV > bV) return 1;
            else return -1;
        });

        var usefulData = data.map(function (d) {
            return {
                'time': +d['action']['ts'],
                'type': d['action']['type'],
                'currentTime': +d['action']['currentTime'],
                'videoID': d['videoId']
            }
        });

        var y = d3.scale.linear()
            .domain([usefulData[0].time, usefulData[usefulData.length - 1].time])
            .range([0, 1130]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .tickFormat(function (d) {
                return d.toString().formatDate("#DD#/#MM#/#YY#");
            });

        frame
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + 1500 + "," + 20 + ")")
            .call(yAxis);

        frame
            .append('line')
            .attr({
                'class': 'timeline',
                'x1': 1500,
                'y1': 20,
                'x2': 1500,
                'y2': 1150
            })
        ;

        frame
            .append('text')
            .attr({
                'class': 'legend-text',
                'x': 1500,
                'y': 5,
                'dy': '.32em',
                'text-anchor': 'middle',
                'fill': 'black'
            })
            .text(usefulData[0].time.toString().formatDate("#DD#/#MM#/#YY#"))
        ;

        frame
            .append('text')
            .attr({
                'class': 'lengend-text',
                'dy': '.32em',
                'text-anchor': 'middle',
                'x': 1500,
                'y': 1165,
                'fill': 'black'
            })
            .text(usefulData[usefulData.length - 1].time.toString().formatDate("#DD#/#MM#/#YY#"))
        ;

        frame
            .append('circle')
            .attr({
                'cx': 1500,
                'cy': 20,
                'r': 10,
                'fill': 'black',
                'class': 'time-pivot'
            })
            .transition()
            .ease("linear")
            .duration((usefulData[usefulData.length - 1].time - usefulData[0].time) / config.playrate)
            .attr('cy', 1165);

        var sliceCount = 0;
        var sliceSize = 500; //data points number to be shown in one slice
        function draw() {
            //if(sliceCount == 5000 ) return;
            //if all data has been shown, return
            if (usefulData.length < sliceCount * sliceSize) return;
            
            //get the data to be shown in this slice
            var start = sliceCount * sliceSize;
            var end = Math.min(usefulData.length, (sliceCount + 1) * sliceSize);
            var slicedData = usefulData.slice(start, end);
            sliceCount++;
            
            var minTime = slicedData[0].time;
            var cyOffset = eachHeight * 0.4 ;
            webgl
                .selectAll('.points_' + sliceCount)
                .data(slicedData).enter()
                .append('circle')
                .attr({
                    cx:function(d){return startOffset + d.currentTime;},
                    cy:function(d){return cyOffset + eachHeight * videoNames[d['videoID']];},
                    r:0,
                    fill:function (d) {return colors(d['type']);},
                    opacity:0,
                    class:'event',
                    filter:'url(#ball-glow2)'
                })
                .transition()
                .delay(function (d, i) { return (d.time - minTime) / config.playrate }).duration(1000)
                .attr({
                    opacity:0.3,
                    r:15
                })
                .transition()
                .duration(1000)
                .attr({
                    opacity:0,
                    r:0
                })
                .remove();
             setTimeout(draw, (slicedData[slicedData.length - 1].time - minTime) / config.playrate);
        }
        draw();

    });

});

