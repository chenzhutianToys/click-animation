import d3 from 'd3';

import MoveLayout from './../../Static/MoveEngine.js';

export default {
    ready() {
        this.InitVariables();
    },

    doc: null,
    timeFormat: null,
    stackLayout: null,
    singleYScale: null,
    singleXScale: null,
    frontGroundStackbar: null,
    timeLineAxis: null,
    moveLayout: null,
    moveLayout2: null,
    videosData: {},
    nodesToAdd: [],
    nodesToAdd2: [],
    xAxisGen: null,
    yAxisGen: null,
    xAxis: null,
    yAxis: null,
    xAxisTimeFormat: null,
    areaGen: null,
    frontGroundAreaGen: null,
    borderLineGen: null,
    digitalClock: null,
    digitalTimeFormat: null,
    digitalDateFormat: null,
    digitalClockHourScale: null,
    digitalClockMinuteScale: null,
    digitalClockRadius: null,
    digitalClockHourHandLength: null,
    digitalClockMinuteHandLength: null,
    digitalClockHandData: null,

    boundarys: {},
    boundarysUpOrDown: {},

    data() {
        return {
            padding: { top: 0, left: 100, bottom: 50, right: 50 },
            chartWidth: 500,
            chartHeight: 400,
            barHeight: 400,
            timeInterval: 60,
            stackBarWidth: 30,
            stackBarMaxY: -Infinity,
            stackBarMaxIndex: 1,
            is2D: false,
            isFragmentChart: false,
            gDirection: 1,
            gMagnitude: 1.8,

            chartTemplate: null,
            layersName: [1, 2, 3],
            clickColor: {
                "pause": "#FFC107",
                "play": "#80CBC4",
                "seeked": "#03A9F4",
                "error": "#607D8B",
                "ratechange": "#00BCD4",
                "stalled": "#EF5350"
            },
            orderMapping: {
                "stalled": 0,
                "ratechange": 1,
                "play": 2,
                "seeked": 3,
                "pause": 4,
                //"error": 5,
            },
            clickBallSplitThreshold: 20,
            //Count for test
            count2: 0,
            count20: 0,
            timer: 0,
            sumTime: 0
        };
    },
    methods: {
        InitVariables() {
            let self = this;
            this.doc = d3.select(this.$el);
            this.timeLineTimeFormat = d3.time.format("%b %d %H:%M");
            this.xAxisTimeFormat = d3.time.format("%M:%S");
            this.stackLayout = d3.layout.stack()
                .offset("zero")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });

            this.singleXScale = d3.scale.linear()
                .range([this.padding.left, this.chartWidth - this.padding.right]);
            this.singleYScale = d3.scale.linear()
                .range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);

            this.chartTemplate = '<svg class="bubble-float-svg" width=' + (this.chartWidth) + ' height=' + (this.chartHeight) + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
            this.nodesToAdd = [];

            this.xAxisGen = d3.svg.axis()
                .scale(this.singleXScale)
                .tickSize(6, 0)
                .orient("bottom");

            this.yAxisGen = d3.svg.axis()
                .scale(this.singleYScale)
                .ticks(4)
                .tickSize(6, 0)
                .orient("left");

            this.areaGen = d3.svg.area()
                .interpolate("basis")
                .x((d) => { return this.singleXScale(d.x); })
                .y0((d) => { return this.singleYScale(d.y0); })
                .y1((d) => { return this.singleYScale(d.y + d.y0); })
                ;
            this.frontGroundAreaGen = d3.svg.area()
                .interpolate("basis")
                .x((d) => { return this.singleXScale(d.x); })
                .y0((d) => { return this.singleYScale(d.y0); })
                .y1((d) => { return this.singleYScale(d.y0 + d.clickNum); })
                ;
            this.borderLineGen = d3.svg.line()
                .x((d) => { return this.singleXScale(d.x); })
                .y((d) => { return this.singleYScale(d.y0); })
                .interpolate("basis")
                ;

            this.digitalDateFormat = d3.time.format("%b %d");
            this.digitalTimeFormat = d3.time.format("%H:%M");
        },
        setTimeInterval(t) {
            if (!t) return;
            this.timeInterval = t;
            if (this.videosData) {
                let keys = Object.keys(this.videosData);
                for (let i = 0, len = keys.length; i < len; ++i) {
                    this.videosData[keys[i]].hasAggregate = false;
                }
            }

            return this;
        },
        setPosition(left, top) {
            d3.select(this.$el).style({
                "top": top + "px",
                "left": left + "px"
            });

            return this;
        },
        setSize(s) {
            if (Array.isArray(s)) {
                this.chartWidth = s[0];
                this.chartHeight = s[1];
                this.chartTemplate = '<svg class="bubble-float-svg" width=' + (this.chartWidth) + ' height=' + (this.chartHeight) + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
                this.singleXScale
                    .range([this.padding.left, this.chartWidth - this.padding.right]);
                this.singleYScale
                    .range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);
                this.xAxisGen.scale(this.singleXScale);
                this.yAxisGen.scale(this.singleYScale);
            }

            return this;
        },
        setBarHeight(h) {
            if (typeof h === "number") {
                this.barHeight = h;
                this.singleYScale
                    .range([this.chartHeight - this.padding.bottom, this.chartHeight - h]);
            }
            return this;
        },
        setPadding(p) {
            if (typeof p === "object") {
                this.padding = p;
            }
            return this;
        },
        setIs2D(t) {
            if (typeof t === "boolean") {
                this.is2D = t;
            }
            return this;
        },
        setFragmentpadding(p) {
            if (typeof p === "number") {
                this.fragmentPadding = p;
            }
            return this;
        },
        videosData(data) {

            let stackGraphIds = Object.keys(data);
            let stackGraphs = stackGraphIds.map(function(d) { return data[d]; });
            this.layersName = stackGraphs[0].layers.filter(d => d.name != "error").map((d) => {
                return d.name;
            });
            this.videosData = data;
            return this;
        },
        getTimeInterval() {
            return this.timeInterval;
        },
        getVideoLength(videoId) {
            let data = this.videosData[videoId];
            return data.layers[0].values.length;
        },
        processData(data) {
            if (!data) return;
            // aggregate the clicks by time
            if (!data.hasAggregate) {
                for (let i = 0, len = data.layers.length; i < len; ++i) {
                    let layer = data.layers[i];
                    let oldValues = layer.values,
                        newValues = [];
                    for (let j = 0, lenj = Math.ceil(oldValues.length / this.timeInterval); j < lenj; ++j) {
                        newValues.push({ x: j, y: 0 });
                    }

                    for (let j = 1, lenj = oldValues.length; j < lenj; ++j) {
                        let newIndex = Math.floor(j / this.timeInterval);
                        newValues[newIndex].y += oldValues[j].y;
                    }
                    layer.values = newValues;
                    layer._original_values = oldValues;
                }
                data.maxTime = Math.floor(data.maxTime / this.timeInterval);

                let maxY = -Infinity;
                // calculate the max Y
                for (let i = 0, len = data.layers[0].values.length; i < len; ++i) {
                    let tempSum = 0;
                    for (let j = 0, lenj = data.layers.length; j < lenj; ++j) {
                        tempSum += data.layers[j].values[i].y;
                    }
                    if (tempSum > maxY) maxY = tempSum;
                }
                data.maxSumValues = maxY;
                this.stackBarMaxY = maxY;
                this.stackBarMaxIndex = data.maxTime;
                data.hasAggregate = true;
            }

            // sort the order;

            let sortedlayers = [];
            this.layersName = [];
            for (let i = 0, len = data.layers.length, d; i < len; ++i) {
                d = data.layers[i];
                sortedlayers[this.orderMapping[d.name]] = d;
                this.layersName[this.orderMapping[d.name]] = d.name;
            }
            data.layers = sortedlayers;
            this.layersName = this.layersName.reverse();
            //update scale
            this.singleXScale.domain([0, data.maxTime]);
            this.singleYScale.domain([0, data.maxSumValues]);
            //update axis-gen
            this.xAxisGen.scale(this.singleXScale);
            this.yAxisGen.scale(this.singleYScale);
        },
        calBoundarys(chart) {
            // init boundary
            let boundary = {},
                tPath, tPathLength, roundDist, isLowerChart,
                tempPlainLayerData = [],
                len = 0;
            //if (this.isFragmentChart) this.layersName.unshift("zero_");
            for (let i = 0, len = this.layersName.length; i < len; ++i) {
                let layerName = this.layersName[i];
                tPath = chart.select("g.layer-border." + layerName);
                isLowerChart = tPath.select(function() { return this.parentNode; }).classed("lower-chart");
                tPath = tPath.select("path").node();
                tPathLength = Math.floor(tPath.getTotalLength());
                boundary[layerName] = { pathLength: tPathLength, isLowerChart: isLowerChart, values: [] };
                roundDist = [];

                for (let j = 0, point, index, dist; j < tPathLength; ++j) {
                    point = tPath.getPointAtLength(j);
                    index = Math.round(point.x);
                    dist = Math.abs(point.x - index);
                    if (roundDist[index]) {
                        if (dist < roundDist[index]) {
                            roundDist[index] = dist;
                            boundary[layerName]['values'][index] = point.y;
                        }
                    } else {
                        roundDist[index] = dist;
                        boundary[layerName]['values'][index] = point.y;
                    }
                }
            }
            this.boundarys = boundary;
        },
        drawFregmentStackBarChart(videoId) {
            this.isFragmentChart = true;
            this.boundarysUpOrDown = {};
            this.clean();
            this.processData(this.videosData[videoId]);

            this.singleYScale.range([(this.chartHeight - this.padding.bottom) * 0.5, this.chartHeight - this.barHeight * 0.5]);
            this.chartTemplate = '<svg class="bubble-float-svg" width=' + (this.chartWidth) + ' height=' + (this.chartHeight + this.fragmentPadding) + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom + this.fragmentPadding) + '></canvas>';

            let chart = this.doc.append("div")
                .attr({
                    "id": videoId,
                    "class": "bubble-float-chart"
                })
                .html(this.chartTemplate)
                .select("svg")
                ;

            let maxIndex = this.singleXScale.domain()[1];
            this.stackBarWidth = this.chartWidth / maxIndex;
            this.xAxisGen.ticks(maxIndex);

            // stack data 
            let data = this.stackLayout(this.videosData[videoId].layers.filter(function(d, i) { return i >= 3; }));
            let data2 = this.stackLayout(this.videosData[videoId].layers.filter(function(d, i) { return i < 3; }));

            // append stackBar
            chart.append("g")
                .attr("class", "back-ground upper-chart")
                .selectAll("g.layer")
                .data(data).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.areaGen(d.values); })
                ;

            chart.append("g")
                .attr("class", "back-ground lower-chart")
                .attr("transform", "translate(0," + (this.fragmentPadding + this.chartHeight * 0.5) + ")")
                .selectAll("g.layer")
                .data(data2).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.areaGen(d.values); })
                ;

            let tempUppest = data[data.length - 1].values.map(function(d) { return { x: d.x, y0: d.y + d.y0 }; });
            this.layersName.unshift("zero_");
            chart.select("g.back-ground.upper-chart")
                .selectAll("g.layer-border")
                .data(data.concat([{ name: "zero_", values: tempUppest }])).enter()
                .append("g")
                .attr("class", function(d) { return "layer-border " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.borderLineGen(d.values); })
                ;

            this.borderLineGen
                .y((d) => { return this.fragmentPadding + this.chartHeight * 0.5 + this.singleYScale(d.y0); })
                ;
            chart.select("g.back-ground.lower-chart")
                .selectAll("g.layer-border")
                .data(data2).enter()
                .append("g")
                .attr("class", function(d) { return "layer-border " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.borderLineGen(d.values); })
                ;

            this.calBoundarys(chart);

            for (let i = 0, len = data.length; i < len; ++i) {
                for (let j = 0, lenj = data[i].values.length; j < lenj; ++j) {
                    data[i].values[j].clickNum = 0;
                }
                this.boundarysUpOrDown[data[i].name] = this.chartHeight * 0.5;
            }
            for (let i = 0, len = data2.length; i < len; ++i) {
                for (let j = 0, lenj = data2[i].values.length; j < lenj; ++j) {
                    data2[i].values[j].clickNum = 0;
                }
                this.boundarysUpOrDown[data2[i].name] = this.chartHeight * 0.5 + this.fragmentPadding;
            }

            this.frontGroundStackbar = chart.append("g")
                .attr("class", "front-ground");
            this.frontGroundStackbar
                .selectAll("g.layer upper-chart")
                .data(data).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.frontGroundAreaGen(d.values); })
                ;
            this.frontGroundStackbar
                .selectAll("g.layer lower-chart")
                .data(data2).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path").attr("transform", "translate(0," + (this.fragmentPadding + this.chartHeight * 0.5) + ")")
                .attr("d", (d) => { return this.frontGroundAreaGen(d.values); })
                ;

            this.drawLegends(chart, chart);
            this.resetMoveLayout(chart);

            return this;
        },
        drawStackAreaChart(videoId) {
            this.isFragmentChart = false;
            this.clean();
            this.processData(this.videosData[videoId]);

            let chart = this.doc.append("div")
                .attr({
                    "id": videoId,
                    "class": "bubble-float-chart"
                })
                .html(this.chartTemplate)
                .select("svg")
                ;

            let maxIndex = this.singleXScale.domain()[1];
            this.stackBarWidth = this.chartWidth / maxIndex;
            this.xAxisGen.ticks(maxIndex);

            // stack data 
            let data = this.stackLayout(this.videosData[videoId].layers);
            // append stackBar
            chart.append("g")
                .attr("class", "back-ground upper-chart")
                .selectAll("g.layer")
                .data(data).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.areaGen(d.values); });

            let tempUppest = data[data.length - 1].values.map(function(d) { return { x: d.x, y0: d.y + d.y0 }; });
            this.layersName.unshift("zero_");
            chart.select("g.back-ground.upper-chart")
                .selectAll("g.layer-border")
                .data(data.concat([{ name: "zero_", values: tempUppest }])).enter()
                .append("g")
                .attr("class", function(d) { return "layer-border " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.borderLineGen(d.values); })
                ;

            this.calBoundarys(chart);

            for (let i = 0, len = data.length; i < len; ++i) {
                for (let j = 0, lenj = data[i].values.length; j < lenj; ++j) {
                    data[i].values[j].clickNum = 0;
                }
            }

            this.frontGroundStackbar = chart.append("g")
                .attr("class", "front-ground");
            this.frontGroundStackbar
                .selectAll("g.layer upper-chart")
                .data(data).enter()
                .append("g")
                .attr("class", function(d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.frontGroundAreaGen(d.values); })
                ;

            this.drawLegends(chart);
            this.resetMoveLayout(chart);
            return this;
        },
        drawNoStackChart(videoId) {
            this.isFragmentChart = false;
            this.clean();
            this.processData(this.videosData[videoId]);
            this.layersName.unshift("zero_");
            let chart = this.doc.append("div")
                .attr({
                    "id": videoId,
                    "class": "bubble-float-chart"
                })
                .html(this.chartTemplate)
                .select("svg");

            this.drawLegends(chart);
            this.resetMoveLayout(chart);
            return this;
        },
        drawStackChart(position, videoId) {
            switch (position) {
                case "middle": {
                    this.drawFregmentStackBarChart(videoId);
                    break;
                }
                case "down": {
                    this.gDirection = -1;
                    this.drawStackAreaChart(videoId);
                    break;
                }
                default: {
                    this.gDirection = 1;
                    this.drawStackAreaChart(videoId);
                }
            }
            return this;
        },
        drawLegends(chart, chart2) {
            this.xAxis = chart.select("g.back-ground.upper-chart").append("g")
                .attr({
                    "class": "x axis",
                    "transform": "translate(" + [-this.stackBarWidth * 0.5, this.chartHeight - this.padding.bottom] + ")"
                })
                .call(this.xAxisGen);
            this.xAxis
                .selectAll(".tick text")
                .text((d, i) => {
                    if (i & 1)
                        return this.xAxisTimeFormat(new Date(this.timeInterval * d * 1000));
                });
            this.xAxis.append("text")
                .attr({
                    "class": "caption",
                    "x": this.chartWidth * 0.5,
                    "y": this.padding.bottom - 5
                })
                .text("Video Progress");

            this.yAxis = chart.select("g.back-ground.upper-chart").append("g")
                .attr({
                    "class": "y axis",
                    "transform": "translate(" + [this.padding.left, 0] + ")"
                })
                .call(this.yAxisGen);

            this.yAxis.append("text")
                .attr({
                    "class": "caption vertical-caption",
                    "x": - this.chartHeight + this.barHeight * 0.5 + this.padding.bottom,
                    "y": -45
                })
                .text("Number of Clicks");

            if (chart2) {
                this.xAxis.attr("transform", "translate(" + [-this.stackBarWidth * 0.5, (this.chartHeight - this.padding.bottom) * 0.5] + ")");

                chart2.select("g.back-ground.lower-chart").append("g")
                    .attr({
                        "class": "x axis",
                        "transform": "translate(" + [-this.stackBarWidth * 0.5, (this.chartHeight - this.padding.bottom) * 0.5] + ")"
                    })
                    .call(this.xAxisGen);

                chart2.select("g.back-ground.lower-chart").append("g")
                    .attr("class", "y axis")
                    .call(this.yAxisGen);
            }


            let legends = chart.append("g")
                .attr({
                    "class": "legend",
                    "transform": "translate(" + [this.chartWidth - this.padding.left, 10] + ")"
                })
                .selectAll("g.legend-rect")
                .data(this.layersName.filter((d, i) => { return i; }))
                .enter()
                .append("g")
                .attr("class", function(d) { return "legend-rect " + d; });

            legends
                .append("rect")
                .attr({
                    "y": (d, i) => { return i * 25; },
                    "height": 20,
                    "width": 20
                })
                ;

            legends
                .append("text")
                .attr({
                    "y": (d, i) => { return i * 25 + 15; },
                    "x": - 5,
                })
                .style({
                    "text-anchor": "end",
                })
                .text(function(d) { return d; });

            this.timeLineAxis = chart.append("g")
                .attr("class", "timeline axis")
                .attr("transform", "translate(" + [this.chartWidth * 0.5, this.chartHeight - this.barHeight - 10] + ")")
                .style("opacity", 1e-6);
            this.timeLineAxis.append("line").attr({ "x1": -50, "x2": 50, "y1": -20, "y2": -20 });
            this.timeLineAxis.append("text");

            //draw digital clock
            this.drawDigitalClock(chart);
        },
        drawDigitalClock(chart) {
            this.digitalClock = chart.append("g")
                .attr("class", "clock-group")
                .attr("transform", "translate(" + [this.chartWidth * 0.5, 60] + ")");
            // this.digitalClock
            //     .append("line")
            //     .attr({
            //         "x1": - 150,
            //         "y1": 80,
            //         "y2": 80,
            //         "x2": 150
            //     });
            // this.digitalClock
            //     .append("text")
            //     .attr({
            //         "class": "date",
            //         "y":150
            //     })
            //     .text("TEST");
            this.digitalClock
                .append("line")
                .attr({
                    "x1": - 150,
                    "y1": 20,
                    "y2": 20,
                    "x2": 150
                });
            this.digitalClock
                .append("text")
                .attr({
                    "class": "date"
                })
                .text("TEST");
            this.digitalClock
                .append("text")
                .attr({
                    "class": "time",
                    "y": 85
                })
                .text("TEST");

            // this.digitalClockHourScale = d3.scale.linear()
            //     .range([0, 330])
            //     .domain([0, 11]);

            // this.digitalClockMinuteScale = d3.scale.linear()
            //     .range([0, 354])
            //     .domain([0, 59]);

            // this.digitalClockRadius = 60;
            // this.digitalClockHourHandLength = 2 * this.digitalClockRadius / 3;
            // this.digitalClockHandData = [
            //     {
            //         type: 'hour',
            //         value: 0,
            //         length: - this.digitalClockHourHandLength,
            //         scale: this.digitalClockHourScale
            //     }
            // ];
            // let circleClock = this.digitalClock.append("g").attr("class", "analog-clock").attr("transform", "translate(0," + 10 + ")");
            // circleClock
            //     .append("circle")
            //     .attr("class", "clockface")
            //     .attr("r", this.digitalClockRadius);
            // circleClock.selectAll(".clockhand")
            //     .data(this.digitalClockHandData).enter()
            //     .append('line')
            //     .attr('class', function(d) {
            //         return d.type + '-hand clockhand';
            //     })
            //     .attr('x1', 0)
            //     .attr('y1', function(d) {
            //         return d.balance ? d.balance : 0;
            //     })
            //     .attr('x2', 0)
            //     .attr('y2', function(d) {
            //         return d.length;
            //     })
            //     .attr('transform', function(d) {
            //         return 'rotate(' + d.scale(d.value) + ')';
            //     });
            // circleClock
            //     .append("circle")
            //     .attr("class", "centerdot")
            //     .attr("r", 2);

        },
        AnimationUpdateDigitalClock(date) {
            if (!this.digitalClock) return;
            if (typeof date === "number" || typeof date === "string") date = new Date(date);
            //this.digitalClock.select("text.date").text(this.digitalDateFormat(date)+" "+this.digitalTimeFormat(date));
            this.digitalClock.select("text.date").text(this.digitalDateFormat(date));
            this.digitalClock.select("text.time").text(this.digitalTimeFormat(date));

            // this.digitalClockHandData[0].value = (date.getHours() % 12) + date.getMinutes() / 60;
            // this.digitalClock.select("g.analog-clock").selectAll("line").data(this.digitalClockHandData)
            //     .transition()
            //     .attr('transform', function(d) {
            //         return 'rotate(' + d.scale(d.value) + ')';
            //     });
        },
        resetMoveLayout() {
            let context = this.doc.select("canvas").node().getContext("2d");
            let tickFunc = (e) => {
                const TWOPI = 2 * Math.PI;
                let gy = e.gy;
                let balls = e.balls,
                    i = -1,
                    ball,
                    n = balls.length;
                let bounds = e.bounds;
                context.clearRect(bounds[0][0], bounds[0][1], bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
                let tickTsData = {};
                let minBall = { dist: -Infinity, barTs: 0 };
                while (++i < n) {
                    ball = balls[i];
                    if (ball.fixed) continue;
                    context.beginPath();
                    context.fillStyle = ball.color;
                    context.arc(ball.x, ball.y, ball.r, 0, TWOPI);
                    context.fill();

                    //if (gy == this.gMagnitude) {
                    if (ball.y < (this.chartHeight - this.barHeight)) {
                        if (ball.y > (this.chartHeight - this.barHeight - 20)) {
                            if (ball.y > minBall.dist) {
                                minBall.dist = ball.y;
                                minBall.barTs = ball.barTs;
                            }
                        }

                    }
                    //}
                }
                // if (minBall.barTs === 0) {
                //     this.timeLineAxis.transition().style("opacity", 1e-6);
                // } else {
                //     this.timeLineAxis.transition().style("opacity", 1).select("text").text(this.timeLineTimeFormat(new Date(+minBall.barTs)));
                // }


                // let len = Object.keys(tickTsData).length;
                // let ticks = this.timeLineAxis.selectAll(".tick").data(Object.keys(tickTsData), function(d){ return d;});
                // ticks.enter().append("g").attr("class","tick").append("text").text((d)=>{ return this.timeLineTimeFormat(new Date(+d));});
                // ticks.attr("transform", function(d){ return "translate(0,"+tickTsData[d]+")";});
                // ticks.exit().remove();

            };
            let sedFunc = (e) => {
                let firstPassNodes = e.firstPassNodes;
                if (this.frontGroundStackbar) {
                    for (let i = 0, len = firstPassNodes.length, node, frontData; i < len; ++i) {
                        node = firstPassNodes[i];
                        frontData = this.frontGroundStackbar.select("g.layer." + node.boundary).data()[0].values;
                        frontData[node.xIndex].clickNum += node.clickNum;

                    }

                    for (let i = 0, len = e.sedLayers.length; i < len; ++i) {
                        this.frontGroundStackbar.select("g.layer." + e.sedLayers[i])
                            .select("path")
                            .transition()
                            .attr("d", (d) => { return this.frontGroundAreaGen(d.values); });
                    }
                }
            };

            let endFunc = (e) => {
                this.frontGroundAreaGen
                    .y1((d) => { return this.singleYScale(d.y0 + d.y); });

                this.frontGroundStackbar.selectAll("g.layer")
                    .select("path")
                    .transition()
                    .attr("d", (d) => { return this.frontGroundAreaGen(d.values); });
            }

            if (this.isFragmentChart) {
                this.moveLayout = MoveLayout([])
                    .friction(4)
                    .gravity([0, - this.gDirection * Infinity, this.gMagnitude])
                    .bounds([[this.padding.left, 0], [this.chartWidth - this.padding.right, this.fragmentPadding + (this.chartHeight - this.padding.bottom) * 0.5]])
                    .boundary(this.boundarys)
                    .on('tick', tickFunc)
                    .on('sed', sedFunc)
                    .on('end', endFunc)
                    ;
                this.moveLayout2 = MoveLayout([])
                    .friction(4)
                    .gravity([0, this.gDirection * Infinity, this.gMagnitude])
                    .bounds([[this.padding.left, this.fragmentPadding + (this.chartHeight - this.padding.bottom) * 0.5], [this.chartWidth - this.padding.right, this.fragmentPadding + this.chartHeight - this.padding.bottom]])
                    .boundary(this.boundarys)
                    .on('tick', tickFunc)
                    .on('sed', sedFunc)
                    .on('end', endFunc)
                    ;
            } else {
                this.moveLayout = MoveLayout([])
                    .friction(4)
                    .gravity([0, this.gDirection * Infinity, 0])
                    .bounds([[this.padding.left, 0], [this.chartWidth - this.padding.right, this.chartHeight - this.padding.bottom]])
                    .boundary(this.boundarys)
                    //.isAABBBoundary(true)
                    .on('tick', tickFunc)
                    .on('sed', sedFunc)
                    .on('end', endFunc)
                    ;
            }
        },
        accelerateBallsDropping(m) {
            if (this.moveLayout && typeof m === "number") {
                this.moveLayout
                    .gravity([0, this.gDirection * Infinity, m * this.gMagnitude]);
            }
        },
        bubbleInitYPositionGen() {
            if (this.is2D) {
                let layersName = Object.keys(this.boundarys);
                if (this.isFragmentChart) {
                    return (ball) => {
                        let layer = ball.boundary;
                        let lastLayerIndex = layersName[layersName.indexOf(layer) - 1];
                        let localUperBoundary = this.boundarys[lastLayerIndex];
                        let upperY;
                        if (localUperBoundary && localUperBoundary.isLowerChart === this.boundarys[layer].isLowerChart) {
                            upperY = localUperBoundary.values[Math.round(ball.x)] + ball.r;
                        } else {
                            upperY = this.boundarys[layer].values[Math.round(ball.x)] - 60;
                        }
                        return upperY;
                    };
                } else {
                    return (ball) => {
                        let layer = ball.boundary;
                        let lastLayerIndex = layersName[layersName.indexOf(layer) - 1];
                        let localUperBoundary = this.boundarys[lastLayerIndex] && this.boundarys[lastLayerIndex].values;
                        let upperY = localUperBoundary ? localUperBoundary[Math.round(ball.x)] + ball.r : this.boundarys[layer].values[Math.round(ball.x)] - 60;

                        return upperY;
                    };
                }
            } else {
                if (this.isFragmentChart) {
                    return (ball) => { return this.boundarysUpOrDown[ball.boundary] + 5 + Math.random() * 20; };
                } else {
                    return () => { return this.gDirection > 0 ? 50 + Math.random() * 20 : (this.height - this.padding.bottom) * 0.9; };
                }

            }
        },
        inputClicks(clicksData, d) {
            let ballsToAdd = {};
            let maxClicks = 1;
            for (let i = 0, len = clicksData.length; i < len; ++i) {
                let click = clicksData[i];
                let xIndex = Math.floor(click.currentTime / this.timeInterval);

                let boundaryIndex = click.type + "-" + xIndex;
                if (boundaryIndex in ballsToAdd) {
                    ++ballsToAdd[boundaryIndex].clickNum;
                    if (ballsToAdd[boundaryIndex].clickNum > maxClicks) maxClicks = ballsToAdd[boundaryIndex].clickNum;
                } else {
                    let xPos = this.singleXScale(xIndex);
                    xPos = xPos + (xIndex >= this.stackBarMaxIndex ? -this.stackBarWidth : this.stackBarWidth * Math.random());
                    ballsToAdd[boundaryIndex] = {
                        'boundary': click.type,
                        "xIndex": xIndex,
                        'barTs': d.ts,
                        'x': xPos,
                        'clickNum': 1,
                        'color': this.clickColor[click.type]
                    };
                }
            }


            let yGen = this.bubbleInitYPositionGen();
            let ballsKeys = Object.keys(ballsToAdd);
            let balls = [],
                balls2 = [];
            for (let i = 0, len = ballsKeys.length, ballCandidate; i < len; ++i) {
                ballCandidate = ballsToAdd[ballsKeys[i]];
                ballCandidate.r = 0.8 * ballCandidate.clickNum;// / maxClicks;
                ballCandidate.y = yGen(ballCandidate);
                ballCandidate.py = ballCandidate.y - 2;
                let tempBallCandidates = [],
                    rThreshold = this.getOffsetBetweenUpAndDown(ballCandidate);
                if (ballCandidate.r > rThreshold) {
                    // if need to split
                    let totalR = ballCandidate.r;
                    while (totalR - rThreshold > 0) {
                        tempBallCandidates.push({
                            'boundary': ballCandidate.boundary,
                            "xIndex": ballCandidate.xIndex,
                            'x': ballCandidate.x,
                            'y': ballCandidate.y,
                            'py': ballCandidate.py,
                            'barTs': ballCandidate.barTs,
                            'r': rThreshold,
                            'clickNum': 0, // no need to cal the clickNum of split balls
                            'color': ballCandidate.color
                        });
                        totalR -= rThreshold;
                    }
                    tempBallCandidates.push({
                        'boundary': ballCandidate.boundary,
                        "xIndex": ballCandidate.xIndex,
                        'x': ballCandidate.x,
                        'y': ballCandidate.y,
                        'py': ballCandidate.py,
                        'barTs': ballCandidate.barTs,
                        'r': totalR,
                        'clickNum': ballCandidate.clickNum, // no need to cal the clickNum of split balls
                        'color': ballCandidate.color
                    });
                } else {
                    // no need to split
                    tempBallCandidates.push(ballCandidate);
                }

                if (this.isFragmentChart) {
                    // if fragment chart, push the balls to differrnt movelayout
                    for (let j = 0, lenj = tempBallCandidates.length; j < lenj; ++j) {
                        let ball = tempBallCandidates[j];
                        if (this.boundarysUpOrDown[ball.boundary] <= this.chartHeight * 0.5) {
                            balls.push(ball);
                        } else {
                            balls2.push(ball);
                        }
                    }

                } else {
                    for (let j = 0, lenj = tempBallCandidates.length; j < lenj; ++j) {
                        balls.push(tempBallCandidates[j]);
                    }
                }
            }
            this.nodesToAdd = balls;
            if (this.isFragmentChart) {
                this.nodesToAdd2 = balls2;
            }
            return this;
        },
        getOffsetBetweenUpAndDown(ball) {
            if (!this.boundarys) return this.clickBallSplitThreshold;
            let boundaryKeys = Object.keys(this.boundarys);
            let lastBoundaryKey = boundaryKeys[boundaryKeys.indexOf(ball.boundary) - 1];
            let uperBoundary = this.boundarys[lastBoundaryKey] && this.boundarys[lastBoundaryKey].values;
            if (!uperBoundary) return this.clickBallSplitThreshold;

            let lowerBoundary = this.boundarys[ball.boundary].values;
            let upperY = uperBoundary[Math.round(ball.x)];
            let lowerY = lowerBoundary[Math.round(ball.x)];
            let offset = lowerY - upperY;
            return Math.min(offset * 0.5, this.clickBallSplitThreshold);

        },
        testMoveLayout(node) {
            this.moveLayout.addNode(node);
        },
        drawClicks() {
            if (this.moveLayout && this.nodesToAdd.length) {

                this.moveLayout.addNodes(this.nodesToAdd);
                this.nodesToAdd = undefined;
                if (this.isFragmentChart) {
                    this.moveLayout2.addNodes(this.nodesToAdd2);
                    this.nodesToAdd2 = undefined;
                }
            }

            return this;
        },
        canBeFinished(t) {
            if (typeof t === "boolean") {
                this.moveLayout.canBeFinished(t);
            }
            return this;
        },
        finish() {
            console.log("finish");
            this.moveLayout.finish();

        },
        clean() {
            this.chartTemplate = '<svg class="bubble-float-svg" width=' + (this.chartWidth) + ' height=' + (this.chartHeight) + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
            this.singleYScale.range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);
            this.borderLineGen.y((d) => { return this.singleYScale(d.y0); });
            this.frontGroundAreaGen.y1((d) => { return this.singleYScale(d.y0 + d.clickNum); });
            this.nodesToAdd = this.nodesToAdd2 = undefined;
            this.doc.select("div").remove();
            this.moveLayout && this.moveLayout.remove();
            this.moveLayout2 && this.moveLayout2.remove();
            this.moveLayout2 = undefined;

        },
        start() {
            this.moveLayout && this.moveLayout.start();
            if (this.isFragmentChart) {
                this.moveLayout2 && this.moveLayout2.start();
            }
        },
        pause() {
            this.moveLayout && this.moveLayout.pause();
        },
        resume() {
            this.moveLayout && this.moveLayout.resume();
        }

    },
}