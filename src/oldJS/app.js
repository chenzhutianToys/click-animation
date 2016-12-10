/* global d3 */
var config = {};
config.playrate = 2000;

// var gui = new dat.GUI();
// gui.add(config, 'playrate', 1000, 4000);
Array.prototype.aggregate =  function(num){
  var length =  this.length;
  var newArray = [];
  var sum = 0;
  for (var i = 0 ; i < length; i++){
    sum += this[i];
    if ((i+1) % num == 0) {
      newArray.push(sum / num);
      sum = 0;
    }
  }
  if (length % num !=0) newArray.push(sum/length%num);
  return newArray;
};

var width = Math.max(960, innerWidth),
    height = Math.max(500, innerHeight);


var height = 2000;
var width = window.innerWidth - 50;
var svg = d3.select("body")
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("id", 'chart');

var frameOffset = { top: 150, left: 100 };
var frame = svg.append('g').attr("class", "frame").attr("transform", "translate(" + frameOffset.left + "," + frameOffset.top + ")");

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

var weekName = [
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

var colors = d3.scale.ordinal()
    .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
    .domain(['seeked', 'pause', 'play', 'stalled', 'ratechange', 'error'])
    ;

//Add legend
var legendWidth = 180;
var legendHeight = 50;
var legendRadius = 15;
var actionTypes = ['play', 'seeked', 'pause', 'stalled', 'error', 'ratechange'];
svg.append('g')
    .attr('class', 'legend')
    .selectAll('.legend-circle')
    .data(actionTypes).enter()
    .append('circle')
    .attr('cx', function (d, i) {
        return frameOffset.left + i * legendWidth;
    })
    .attr('cy', legendHeight / 2)
    .attr('r', legendRadius)
    .attr('fill', function (d) {
        return colors(d);
    })
    .attr('class', "legend-circle")
    .attr('filter', 'url(#ball-glow2)');

svg.select('g.legend')
    .selectAll('.legend-text')
    .data(actionTypes).enter()
    .append('text')
    .attr('class', 'legend-text')
    .attr("x", function (d, i) {
        return frameOffset.left + i * legendWidth + 2 * legendRadius;
    })
    .attr("y", legendHeight / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .attr('fill', function (d) {
        return colors(d);
    })
    .text(function (d) {
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
videos.forEach(function (d, i) {
    return videoNames[d.videoID] = i;
});

var eachHeight = 130;
var eachWidth = width - frameOffset.left - 100;
var startOffset = 0;
frame.selectAll('.video-name')
    .data(weekName).enter()
    .append('text')
    .attr('class', 'legend-text')
    .attr("x", -10)
    .attr("y", function (d, i) {
        return i * eachHeight + eachHeight * 0.4;
    })
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .text(function (d) {
        return d;
    })
;

d3.json("data/typeCount_noDiff.json", function (data1) {
    var types = data1[0].clicks.map(function (d) {
        return d.type;
    });

    var streamData = data1.map(function (d) {
        //
        return d.clicks.map(function (dat) {
            var length = dat.data.length;
            var result = dat.data.slice(3, length - 3).aggregate(5).map(function (dd, i) {
                return {
                    x: i,
                    y: dd
                }
            });
            return result;
        })
    });
    
    //streamData
    var stack = d3.layout.stack();
    var layers = streamData.map(function (d) {
        return stack(d);
    });

    var x = d3.scale.linear()
        .domain([0, d3.max(layers.map(function (d) {
            return d[0].length - 1;
        }))])
        .range([0, eachWidth]);

    var y = d3.scale.linear()
        .domain([0, d3.max(layers, function (layer) { return d3.max(layer, function (l) { return d3.max(l, function (d) { return d.y0 + d.y; }); }) })])
        .range([eachHeight, 0]);

    var area = d3.svg.area()
        .x(function (d) { return startOffset + x(d.x); })
        .y0(function (d) { return y(d.y0) })
        .y1(function (d) { return y(d.y0 + d.y) })
        .interpolate('basis');

    var stackArea = frame.selectAll(".themeriver")
        .data(layers)
        .enter().append("g")
        .attr('class', 'themeriver')
        .attr('transform', function (d, i) {
            return 'translate(0,' + eachHeight * (i - 0.5) + ')'
        })
        ;
    stackArea
        .selectAll('path')
        .data(function (d) { return d; })
        .enter().append('path')
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

        var usefulDataHash = {};
        var usefulData = data.map(function (d, i) {
            var time = +d['action']['ts'];
            var clickObj = {
                'time': time,
                'type': d['action']['type'],
                'currentTime': +d['action']['currentTime'],
                'videoID': d['videoId']
            };

            if (!usefulDataHash[time]) {
                usefulDataHash[time] = i;
            }
            return clickObj;
        });

        var yAxisLength = 1200;
        var yAxisScale = d3.time.scale()
            .domain(d3.extent(usefulData, function (d) {
                return new Date(d.time);
            }))
            .range([0, yAxisLength]).nice();
        var yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .orient("right")
            .tickFormat(function (d) {
                return d3.time.format("%d/%m/%y")(d);
            });

        frame
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (eachWidth + 20) + "," + 20 + ")")
            .call(yAxis);

        var drag = d3.behavior.drag()
            .origin(function (d) { return d; })
            .on("dragstart", function () {
                d3.select(this).transition().duration(0);
            })
            .on("drag", function (d) {
                d.y = d3.event.y < 20 ?
                    20 :
                    d3.event.y > yAxisLength ?
                        yAxisLength :
                        d3.event.y;
                d3.select(this)
                    .attr("cy", d.y)
                ;
            })
            .on("dragend", function (d) {
                var nowTime = yAxisScale.invert(d.y).getTime() + "";
                console.log(usefulDataHash[nowTime]);
                d3.select(this)
                    .transition()
                    .duration((usefulData[usefulData.length - 1].time - nowTime) / config.playrate)
                    .attr('cy', yAxisLength)
                ;
            });

        frame
            .append('circle')
            .data([{ x: (eachWidth + 20), y: 20 }])
            .attr({
                'cx': function (d) { return d.x; },
                'cy': function (d) { return d.y; },
                'r': 10,
                'fill': 'black',
                'class': 'time-pivot'
            })
            .call(drag)
            .transition()
            .duration((usefulData[usefulData.length - 1].time - usefulData[0].time) / config.playrate)
            .attr('cy', yAxisLength)
        ;

        var sliceCount = 0;
        var sliceSize = 100; //data points number to be shown in one slice
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
            var cyOffset = eachHeight * 0.45;
            frame
                .selectAll('.points_' + sliceCount)
                .data(slicedData).enter()
                .append('circle')
                .attr({
                    cx: function (d) { return startOffset + x(d.currentTime * 0.196); },
                    cy: function (d) { return cyOffset + eachHeight * videoNames[d['videoID']]; },
                    r: 0,
                    fill: function (d) { return colors(d['type']); },
                    opacity: 0.6,
                    class: 'event',
                    filter: 'url(#ball-glow2)'
                })
                .transition()
                .delay(function (d) { return (d.time - minTime) / config.playrate })
                .duration(1000)
                .ease('cubic')
                .attr({
                    opacity: 0,
                    r: 40
                })
                .remove();
            setTimeout(draw, (slicedData[slicedData.length - 1].time + 1000 - minTime) / config.playrate);
        }
        draw();

    });

});

