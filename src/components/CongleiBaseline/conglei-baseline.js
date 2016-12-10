import Bubble from './../BubbleFloat/BubbleFloat.vue';

export default {
    components: {
        BubbleFloat: Bubble
    },
    ready() {
        Array.prototype.aggregate = function (num) {
            let length = this.length;
            let newArray = [];
            let sum = 0;
            for (let i = 0; i < length; i++) {
                sum += this[i];
                if ((i + 1) % num == 0) {
                    newArray.push(sum / num);
                    sum = 0;
                }
            }
            if (length % num != 0) newArray.push(sum / length % num);
            return newArray;
        };

        this.InitVariables();
        if (!this.clickData) {
            this.$root.getData();
        }
    },
    doc: null,
    svg: null,
    stackGraph: null,
    contextTimeLineG: null,
    contextXscale: null,
    contextTimeLineXAxisGen: null,
    contextTimeLineXAxis: null,

    stackXscale: null,
    stackYscale: null,
    stackXAxisGen: null,
    stackYAxisGen: null,
    stackXAxis: null,
    stackYAxis: null,
    xAxisTimeFormat: null,
    areaGen: null,
    stackLayout: null,
    digitalClock: null,
    digitalTimeFormat: null,
    digitalDateFormat: null,
    clickData: null,
    stackData: null,
    animationTimer: null,

    data() {
        return {
            padding: { top: 0, right: 50, bottom: 30, left: 50 },
            width: null,
            height: null,
            center: null,
            titleHeight: null,
            viewInnerWidth: null,
            viewInnerHeight: null,

            selectedVideo: null,

            timeInterval: 60,
            stackBarMaxY: 0,
            stackBarMaxIndex: 0,
            stackBarWidth: 0,
            chartHeight: 300,
            barHeight: 300,
            chartWidth: 0,
            playrate: 20000,
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
        }
    },
    methods: {
        setRawdata(data, stackData) {
            this.clickData = {};
            for (let i = 0, len = data.length; i < len; ++i) {
                if (data[i].currentTime === 0) continue;
                data[i].date = new Date(data[i].ts);

                let videoId = data[i].videoId;
                if (!this.clickData[videoId]) this.clickData[videoId] = {};
                let videoData = this.clickData[videoId];

                if (!videoData.clickDataGroupByTimeArray) videoData.clickDataGroupByTimeArray = [];
                videoData.clickDataGroupByTimeArray.push(data[i]);
            }

            let videoIds = Object.keys(this.clickData);
            for (let i = 0, len = videoIds.length; i < len; ++i) {
                let videoData = this.clickData[videoIds[i]];
                videoData.clickDataGroupByTimeArray.sort(function (a, b) {
                    return +a.ts - +b.ts;
                });
            }

            this.stackData = stackData;

            this.$refs.bubbleFloatComponent
                .setBarHeight(this.stackBarChartHeight)
                .setTimeInterval(30)
                .videosData(stackData);
            return videoIds;
        },
        SelectVideo(selectedVideo) {
            this.selectedVideo = selectedVideo;

            this.clean();

            let videoData = this.clickData[this.selectedVideo];
            let tempL1A = videoData.clickDataGroupByTimeArray;

            //set up domain of each scale
            this.contextXscale.domain(d3.extent(tempL1A, function (d) { return +d.ts; }));
            this.xDomainMin = this.contextXscale.domain()[0];
            this.xDomainMax = this.contextXscale.domain()[1];
            setTimeout(this.InitView, 20);
        },
        InitVariables() {
            this.doc = d3.select(this.$el);
            this.titleHeight = this.doc.select(".mdl-card__title").node().clientHeight;
            this.width = this.doc.node().clientWidth;
            this.height = this.doc.node().clientHeight - this.titleHeight;
            this.viewInnerWidth = this.width;
            this.viewInnerHeight = this.height;
            this.contextTimeLineHeight = this.height * 0.10;
            this.chartWidth = this.width - this.padding.left - this.padding.right;
            this.chartHeight = this.height * 0.7;
            this.svg = this.doc.select("svg.conglei-svg").attr("height", this.viewInnerHeight);

            this.center = [this.viewInnerWidth * 0.5, this.viewInnerHeight * 0.5];

            this.svg.append("rect").attr({
                "class": "svg-background",
                "x": 0,
                "y": 0,
                "width": this.width,
                "height": this.height * 0.15
            });

            this.stackLayout = d3.layout.stack()
                .offset("zero")
                .values(function (d) { return d.values; })
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; });
            this.xAxisTimeFormat = d3.time.format("%M:%S");
            this.contextXscale = d3.time.scale().range([this.padding.right, this.viewInnerWidth - this.padding.left]);
            this.contextTimeLineXAxisGen = d3.svg.axis()
                .scale(this.contextXscale)
                .orient("top")
                .tickSize(6, 0)
                .tickFormat(function (d) { return d3.time.format("%b %d")(d); });

            this.stackXscale = d3.scale.linear()
                .range([this.padding.left, this.chartWidth - this.padding.right]);
            this.stackXAxisGen = d3.svg.axis()
                .scale(this.stackXscale)
                .tickSize(6, 0)
                .orient("bottom");

            this.stackYscale = d3.scale.linear()
                .range([this.chartHeight * 0.8 - this.padding.bottom, this.chartHeight * 0.8 - this.barHeight]);
            this.stackYAxisGen = d3.svg.axis()
                .scale(this.stackYscale)
                .ticks(4)
                .tickSize(6, 0)
                .orient("left");
            this.areaGen = d3.svg.area()
                .interpolate("basis")
                .x((d) => { return this.stackXscale(d.x); })
                .y0((d) => { return this.stackYscale(d.y0); })
                .y1((d) => { return this.stackYscale(d.y + d.y0); });

            this.digitalDateFormat = d3.time.format("%b %d");
            this.digitalTimeFormat = d3.time.format("%H:%M");
        },
        InitView() {
            this.contextTimeLineG = this.svg.append("g")
                .attr("class", "time-line-context-group")
                .attr("transform", "translate(" + [0, this.padding.top + this.titleHeight] + ")");

            this.contextTimeLineXAxis = this.contextTimeLineG.append("g")
                .attr("class", "x axis");

            this.contextTimeLineXAxis.call(this.contextTimeLineXAxisGen);
            this.contextTimeLineXAxis
                .append("circle")
                .attr({
                    'cx': this.contextXscale.range()[0],
                    'r': 10,
                    'class': 'time-pivot'
                });
            this.drawStackGraph();
        },
        processStackData(data) {
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
            this.stackXscale.domain([0, data.maxTime]);
            this.stackYscale.domain([0, data.maxSumValues]);
            //update axis-gen
            this.stackXAxisGen.scale(this.stackXscale);
            this.stackYAxisGen.scale(this.stackYscale);
        },
        drawStackGraph() {
            this.processStackData(this.stackData[this.selectedVideo]);
            let chart = this.stackGraph = this.svg.append("g").attr({
                "class": "stack-graph",
                "transform": () => {
                    return "translate(" + [this.padding.left, this.height * 0.25] + ")"
                }
            });

            let maxIndex = this.stackXscale.domain()[1];
            this.stackBarWidth = this.chartWidth / maxIndex;
            this.stackXAxisGen.ticks(maxIndex);
            let data = this.stackLayout(this.stackData[this.selectedVideo].layers);
            // append stackBar
            chart.append("g")
                .attr("class", "back-ground upper-chart")
                .style('opacity', 1e-6)
                .selectAll("g.layer")
                .data(data).enter()
                .append("g")
                .attr("class", function (d) { return "layer " + d.name; })
                .append("path")
                .attr("d", (d) => { return this.areaGen(d.values); });

            //this.drawLegends(chart);
            this.drawDigitalClock(this.svg);
            this.start();
        },
        drawLegends(chart) {
            this.stackXAxis = chart.select("g.back-ground.upper-chart").append("g")
                .attr({
                    "class": "x axis",
                    "transform": "translate(" + [-this.stackBarWidth * 0.5 + this.padding.left, this.chartHeight * 0.8 - this.padding.bottom] + ")"
                })
                .call(this.stackXAxisGen);
            this.stackXAxis
                .selectAll(".tick text")
                .text((d, i) => {
                    if (i & 1) return this.xAxisTimeFormat(new Date(this.timeInterval * d * 1000));
                });
            this.stackXAxis.append("text")
                .attr({
                    "class": "caption",
                    "x": this.chartWidth * 0.5,
                    "y": this.padding.bottom + 20
                })
                .text("Video Progress");

            this.stackYAxis = chart.select("g.back-ground.upper-chart").append("g")
                .attr({
                    "class": "y axis",
                    "transform": "translate(" + [this.padding.left, 0] + ")"
                })
                .call(this.stackYAxisGen);

            this.stackYAxis.append("text")
                .attr({
                    "class": "caption vertical-caption",
                    "x": - this.chartHeight * 0.8 + this.barHeight * 0.5 + this.padding.bottom,
                    "y": -45
                })
                .text("Number of Clicks");

            let legends = chart.append("g")
                .attr({
                    "class": "legend",
                    "transform": "translate(" + [this.chartWidth - this.padding.left, 10] + ")"
                })
                .selectAll("g.legend-rect")
                .data(this.layersName)
                .enter()
                .append("g")
                .attr("class", function (d) { return "legend-rect " + d; });

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
                .text(function (d) { return d; });

            //draw digital clock
        },
        drawDigitalClock(chart) {
            this.digitalClock = chart.append("g")
                .attr("class", "clock-group")
                .attr("transform", "translate(" + [this.center[0], this.padding.top + this.titleHeight + this.height * 0.2] + ")");
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
        },

        AnimationUpdateDigitalClock(date) {
            if (!this.digitalClock) return;
            if (typeof date === "number" || typeof date === "string") date = new Date(date);
            this.digitalClock.select("text.date").text(this.digitalDateFormat(date));
            this.digitalClock.select("text.time").text(this.digitalTimeFormat(date));
        },
        start() {
            let draw = () => {

                if (allDataLength < sliceCount * sliceSize) return;
                //get the data to be shown in this slice
                let start = sliceCount * sliceSize;
                let end = Math.min(tempL1A.length, (sliceCount + 1) * sliceSize);
                let slicedData = tempL1A.slice(start, end);
                let dataCount = slicedData.length;
                let minTime = slicedData[0].ts;
                sliceCount++;

                let endCount = 0;
                chart
                    .selectAll('.points_' + sliceCount)
                    .data(slicedData, function (d) { return d.ts; })
                    .enter().append('circle')
                    .attr({
                        class: (d) => { return d.type; },
                        cx: (d) => { return this.stackXscale(d.currentTime / this.timeInterval); },
                        r: 0,
                        opacity: 1
                    })
                    .transition()
                    .delay((d) => { return (d.ts - minTime) / this.playrate })
                    .duration(1000)
                    .ease('cubic')
                    .attr({
                        opacity: 0.2,
                        r: circleRadiu
                    })
                    .each("end", function (d) {
                        ++endCount;
                        d3.select(this).remove();
                        if (endCount === dataCount) {
                            draw();
                        }
                    });

                //this.animationTimer = setTimeout(draw, (slicedData[slicedData.length - 1].ts + 1010 - minTime) / this.playrate);
            }
            console.log(this.stackXscale.domain());
            console.log(this.stackXscale.range());

            let currentTime,
                lastTime = this.contextXscale.domain()[0].getTime();
            let isBegin = false;

            let tempL1A = this.clickData[this.selectedVideo].clickDataGroupByTimeArray,
                allDataLength = tempL1A.length;

            console.log(tempL1A);

            let sliceCount = 0,
                sliceSize = 100;

            let circleRadiu = 40;
            let chart = this.stackGraph.append("g")
                .attr("class", "event-circle")
                .attr("transform", "translate(" + [0, this.chartHeight - this.padding.bottom - circleRadiu] + ")");

            setTimeout(() => {
                this.stackGraph.select('g.back-ground').transition().duration(1000).style('opacity', '1');
            }, 10000);


            this.contextTimeLineXAxis
                .select("circle")
                .transition().ease("linear")
                .duration((this.contextXscale.domain()[1].getTime() - this.contextXscale.domain()[0].getTime()) / this.playrate)
                .attrTween("cx", () => {
                    return (t) => {
                        currentTime = this.contextXscale.domain()[0].getTime() + t * (this.contextXscale.domain()[1].getTime() - this.contextXscale.domain()[0].getTime());
                        this.AnimationUpdateDigitalClock(currentTime);
                        if (!isBegin) {
                            if (currentTime < tempL1A[0].ts) return;
                            else {
                                isBegin = true;
                                draw();
                            }
                        }
                        lastTime = currentTime;
                        return this.contextXscale.range()[0] + t * (this.contextXscale.range()[1] - this.contextXscale.range()[0]);
                    }
                });

        },
        stop() {
            clearTimeout(this.animationTimer);
        },
        clean() {
            this.stop();
            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
            this.stackGraph && this.stackGraph.selectAll("*").remove();
            this.digitalClock && this.digitalClock.selectAll("*").remove();
        }
    }
}
