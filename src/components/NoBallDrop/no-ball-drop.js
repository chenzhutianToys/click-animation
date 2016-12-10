import d3 from 'd3';
import mdl from "material-design-lite";
import "material-design-lite/src/material-design-lite.scss";

// components here
import Bubble from "./../BubbleFloat/BubbleFloat.vue";

// self lib here
import TimeLine from './../../Static/TimeLine.js';

export default {
    components: {
        BubbleFloat: Bubble
    },
    ready() {
        this.InitVariables();
        console.log("ready no-ball-drop");
        if (!this.clickData) {
            this.$root.getData();
        }
    },

    // Complex data here
    //d3 element
    doc: null,
    svg: null,
    contextTimeLineG: null,
    //xAxis: null,
    timelineChartData: null,
    timelineChartLineGen: null,
    animation: null,
    digitalClock: null,

    //d3 drawing helper
    focusXscale: null,
    contextXscale: null,
    contextBarChartYscale: null,
    arcGen: null,
    brush: null,
    dateFormat: null,
    timeFormat: null,

   

    data() {
        return {
            clickData: null,
            
            padding: { top: 0, right: 20, bottom: 30, left: 20 },
            width: null,
            height: null,
            center: null,
            titleHeight: null,
            viewInnerWidth: null,
            viewInnerHeight: null,
            contextTimeLineHeight: null,
            contextTimeLineY: null,
            stackBarChartHeight: 300,
            focusRegionWidth: 200,
            focusRegionScale: 20,
            focusMoveRange: 10,

            //control panel
            zoomScaleMax: 8,
            focusTimeLineViewScale: 1,
            focusDataScale: 1,
            isAcceleration: true,
            accelerateMode: "domain",

            selectedVideo: "",

            // durations:[5000,1500,2500,5000],
            baseDuration: 1000,
            currentDuration: 1000,

            // timeIntervals: [
            //     { name: "Second", ms: 1000 },           //0
            //     { name: "Minute", ms: 60 * 1000 },      //1
            //     { name: "Hour", ms: 60 * 60 * 1000 },   //2
            //     { name: "Day", ms: 24 * 60 * 60 * 1000 }//3
            // ],
            timeInterval: { name: "Hour", ms: 60 * 60 * 1000 }, // hour

            is2D: false,

            //data to draw
            xDomainMin: null,
            xDomainMax: null,
        }
    },
    methods: {
        setRawdata(data, stackData) {
            this.clickData = {};
            let time2edInterval = (this.zoomScaleMax * this.timeInterval.ms);
            for (let i = 0, len = data.length; i < len; ++i) {
                if (data[i].currentTime === 0) continue;
                data[i].date = new Date(data[i].ts);

                let videoId = data[i].videoId;
                if (!this.clickData[videoId]) this.clickData[videoId] = {};
                let videoData = this.clickData[videoId];

                if (!videoData.clickDataGroupByTimeArray) videoData.clickDataGroupByTimeArray = {};
                if (!videoData.clickDataGroupByTimeDict) videoData.clickDataGroupByTimeDict = {};
                if (!videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale] = [];
                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale] = {};
                if (!videoData.clickDataGroupByTimeArray[this.zoomScaleMax]) videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};

                let index = Math.floor(data[i].ts / this.timeInterval.ms);
                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index] = [];
                videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index].push(data[i]);

                index = Math.floor(data[i].ts / time2edInterval);
                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index] = [];
                videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index].push(data[i]);
            }

            let videoIds = Object.keys(this.clickData);
            for (let i = 0, len = videoIds.length; i < len; ++i) {
                let videoData = this.clickData[videoIds[i]];
                let timeKeys = Object.keys(videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]);
                for (let j = 0, lenj = timeKeys.length; j < lenj; ++j) {
                    videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale][j] = {
                        ts: +timeKeys[j] * this.timeInterval.ms,
                        value: videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][timeKeys[j]]
                    };
                }

                timeKeys = Object.keys(videoData.clickDataGroupByTimeDict[this.zoomScaleMax]);
                for (let j = 0, lenj = timeKeys.length; j < lenj; ++j) {
                    videoData.clickDataGroupByTimeArray[this.zoomScaleMax][j] = {
                        ts: +timeKeys[j] * time2edInterval,
                        value: videoData.clickDataGroupByTimeDict[this.zoomScaleMax][timeKeys[j]]
                    };
                }
            }


            this.$refs.bubbleFloatComponent
                .setBarHeight(this.stackBarChartHeight)
                .setIs2D(this.is2D)
                .setTimeInterval(30)
                .videosData(stackData);

            return videoIds;
        },
        processData(tempL1A) {
            if (tempL1A.statics) return;
            let extent = d3.extent(tempL1A, function (d) { return d.value.length; });
            let max = extent[1];
            let min = extent[0];
            let mean = d3.mean(tempL1A, function (d) { return d.value.length; });
            let median = d3.median(tempL1A, function (d) { return d.value.length; });
            let deviation = d3.deviation(tempL1A, function (d) { return d.value.length; });
            tempL1A.statics = {
                extent: extent,
                max: max,
                min: min,
                mean: mean,
                median: median,
                deviation: deviation
            };
        },
        calOutLier(tempL1A) {
            if (tempL1A.outliers) return;
            if (!tempL1A.statics) this.processData(tempL1A);
            let statics = tempL1A.statics;
            let mean = statics.mean;
            let deviation = statics.deviation;
            let sigmaCount = 2;
            let upperBound = mean + sigmaCount * deviation;
            let lowerBound = mean - sigmaCount * deviation;
            let outliers = [];
            for (let i = 0, len = tempL1A.length, value; i < len; ++i) {
                value = tempL1A[i].value.length;
                if (value > upperBound || value < lowerBound) {
                    tempL1A[i].isOutlier = true;
                    outliers.push(tempL1A[i]);
                }
            }
            tempL1A.outliers = outliers;
            for (let i = 0, len = tempL1A.length; i < len;) {
                let bar = tempL1A[i];
                if (bar.isOutlier) {
                    let j = i - 5;
                    while (++j < (i + 5)) {
                        if (tempL1A[j]) {
                            if (tempL1A[j].siso) {
                                let t = j + 1;
                                while (tempL1A[--t].siso) tempL1A[t].siso = 0;
                            } else {
                                tempL1A[j].siso = j - i;
                            }
                        }
                    }
                    i = i + 5;
                } else {
                    ++i;
                }
            }

            let timeInterval = this.$refs.bubbleFloatComponent.getTimeInterval();
            let outliersStatics = [];
            let videoLength = this.$refs.bubbleFloatComponent.getVideoLength(this.selectedVideo);
            for (let i = 0, len = outliers.length; i < len; ++i) {
                let outlier = outliers[i];
                let newValues = [{}, {}, {}];
                for (let j = 0, lenj = outlier.value.length; j < lenj; ++j) {
                    let click = outlier.value[j];
                    let newIndex = click.currentTime / videoLength;

                    if (newIndex < (1 / 3)) { newIndex = 0; }
                    else if (newIndex < (2 / 3)) { newIndex = 1; }
                    else { newIndex = 2; }

                    if (click.type in newValues[newIndex]) {
                        newValues[newIndex][click.type]++;
                    } else {
                        newValues[newIndex][click.type] = 0;
                    }
                }

                for (let j = 0, lenj = newValues.length; j < lenj; ++j) {
                    let tTypes = newValues[j];
                    //let baseValue = 0;
                    let maxType;
                    let maxValue = -1;
                    Object.keys(tTypes).forEach((d) => {
                        if (tTypes[d] > maxValue) {
                            maxType = { type: d };
                            maxValue = tTypes[d];
                        }
                    });
                    if (maxType) maxType.ts = outlier.ts;
                    newValues[j] = maxType;
                }
                outliersStatics.push({
                    ts: outlier.ts,
                    indicatorData: newValues
                });
            }
            tempL1A.outliersStatics = outliersStatics;
        },
        SelectVideo(selectedVideo) {
            this.selectedVideo = selectedVideo;
            let videoData = this.clickData[this.selectedVideo];
            let tempL1A = videoData.clickDataGroupByTimeArray[1];
            let tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
            if (!tempL2A) {
                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
                let tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
                let time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
                for (let i = 0, len = tempL1A.length; i < len; ++i) {
                    let clicks = tempL1A[i].value;
                    for (let j = 0, lenj = clicks.length; j < lenj; ++j) {
                        let click = clicks[j];
                        let index = Math.floor(click.ts / time2edInterval);
                        if (!tempL2D[index]) tempL2D[index] = [];
                        tempL2D[index].push(click);
                    }
                }

                let timeKeys = Object.keys(tempL2D);
                for (let i = 0, len = timeKeys.length; i < len; ++i) {
                    tempL2A[i] = {
                        ts: +timeKeys[i] * time2edInterval,
                        value: tempL2D[timeKeys[i]]
                    };
                }
            }
            this.calOutLier(tempL1A);
            this.calOutLier(tempL2A);

            //set up domain of each scale
            this.contextBarChartYscale.domain(tempL1A.statics.extent);
            this.focusXscale.domain(d3.extent(tempL1A, function (d) { return +d.ts; }));
            this.contextXscale.domain(this.focusXscale.domain());
            this.xDomainMin = this.focusXscale.domain()[0];
            this.xDomainMax = this.focusXscale.domain()[1];
            setTimeout(this.InitView, 20);
        },
        SelectSpeed(zoomScaleMax) {
            this.zoomScaleMax = zoomScaleMax;
            let videoData = this.clickData[this.selectedVideo];
            let tempL1A = videoData.clickDataGroupByTimeArray[1];
            let tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
            if (!tempL2A) {
                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
                let tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
                let time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
                for (let i = 0, len = tempL1A.length; i < len; ++i) {
                    let clicks = tempL1A[i].value;
                    for (let j = 0, lenj = clicks.length; j < lenj; ++j) {
                        let click = clicks[j];
                        let index = Math.floor(click.ts / time2edInterval);
                        if (!tempL2D[index]) tempL2D[index] = [];
                        tempL2D[index].push(click);
                    }
                }

                let timeKeys = Object.keys(tempL2D);
                for (let i = 0, len = timeKeys.length; i < len; ++i) {
                    tempL2A[i] = {
                        ts: +timeKeys[i] * time2edInterval,
                        value: tempL2D[timeKeys[i]]
                    };
                }
            }
            this.calOutLier(tempL1A);
            this.calOutLier(tempL2A);

            this.InitView();
        },
        ChangeAcceleration(isAcceleration) {
            this.isAcceleration = isAcceleration;
            if (!this.isAcceleration) {
                this.focusTimeLineViewScale = 1;
            }
        },
        InitVariables() {
            this.doc = d3.select(this.$el);
            this.titleHeight = this.doc.select(".mdl-card__title").node().clientHeight;
            this.width = this.doc.node().clientWidth;
            this.viewInnerWidth = this.width;
            this.height = this.doc.node().clientHeight - this.titleHeight;
            this.contextTimeLineHeight = this.height * 0.10;
            this.viewInnerHeight = this.height * 0.15;
            this.svg = this.doc.select("svg.screen-scroll-svg").attr("height", this.viewInnerHeight);
            this.svg.append("rect").attr({
                "class": "svg-background",
                "x": 0,
                "y": 0,
                "width": this.width,
                "height": this.viewInnerHeight
            });
            this.center = [this.viewInnerWidth * 0.5, this.viewInnerHeight * 0.5];

            this.contextTimeLineY = 0;

            // Scales
            this.contextXscale = d3.time.scale();

            this.contextBarChartYscale = d3.scale.linear()
                .range([0, this.contextTimeLineHeight]);

            this.focusXscale = d3.time.scale();
            this.arcGen = d3.svg.arc().innerRadius(0).outerRadius(200).startAngle(0).endAngle(2 * Math.PI);
            this.timelineChartLineGen = d3.svg.line().interpolate("monotone").tension(0.8).x((d) => { return d.x; }).y((d) => { return d.y; });
            this.dateFormat = d3.time.format("%b %d");
            this.timeFormat = d3.time.format("%H:%M");

            this.brush = d3.svg.brush()
                .x(this.contextXscale);
        },
        drawDigitalClock(chart) {
            this.digitalClock = chart.append("g")
                .attr("class", "clock-group")
                .attr("transform", "translate(" + [this.center[0], this.center[1]] + ")");
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
        drawFisheyeContextTimeLine(tempL1A) {
            let focusRegionWidth = this.focusRegionWidth;
            let scaleSize = this.focusRegionScale;

            this.contextXscale.range([this.center[0] + 0.5 * focusRegionWidth, this.width - this.padding.right]);
            let oneBarRange = this.contextXscale(this.contextXscale.domain()[0].getTime() + this.timeInterval.ms) - this.contextXscale(this.contextXscale.domain()[0].getTime());
            this.focusMoveRange = 1 * oneBarRange;
            this.contextXscale.range([this.contextXscale.range()[0] + this.focusMoveRange, this.contextXscale.range()[1] + this.focusMoveRange]);
            this.contextTimeLineG = this.svg.append("g")
                .attr("class", "time-line-context-group")
                .attr("transform", "translate(" + [0, 0] + ")");

            // timeline verlocity distributtion
            let lineChartData = d3.range(this.contextXscale.range()[1] - this.contextXscale.range()[0])
                .map((d, i) => {
                    return { ox: d + this.contextXscale.range()[0], x: d + this.contextXscale.range()[0], y: 0 };
                });
            // see whether is outlier
            for (let i = 0, len = tempL1A.outliers.length; i < len; ++i) {
                let d = tempL1A.outliers[i];
                let index = Math.floor(this.contextXscale(d.ts) - this.contextXscale.range()[0]);
                if (lineChartData[index] && d.isOutlier) {
                    lineChartData[index].isOutlier = true;
                }
            }

            // filter non-outlier
            lineChartData = lineChartData.filter(function (d, i) {
                if (d.isOutlier) return true;
                if (!(i & 3)) return true;
                return false;
            });
            // set Y 
            for (let i = 0, len = lineChartData.length; i < len;) {
                let d = lineChartData[i];
                if (d.isOutlier) {
                    let j = i - 3;
                    while (++j < (i + 4)) {
                        if (lineChartData[j]) {
                            lineChartData[j].y = this.contextBarChartYscale.range()[1] * 0.5;
                        }
                    }
                    i = i + 4;
                } else {
                    if (i & 1) {
                        d.y = 0;
                    } else {
                        d.y = this.contextTimeLineHeight - this.padding.bottom;
                    }
                    ++i;
                }
            }
            this.timelineChartData = lineChartData;
            //interpolate("basis")
            this.contextTimeLineG
                .append("g").attr("class", "time-line-chart")
                .attr("transform", "translate(0," + (this.viewInnerHeight - this.padding.bottom - this.contextTimeLineHeight + 5) + ")")
                .datum(lineChartData)
                .append("path")
                .attr("d", this.timelineChartLineGen);

            // Context TimeLine barChart
            this.contextTimeLineG
                .append("g").attr("class", "bar-chart-group")
                .selectAll(".bar-chart")
                .data(tempL1A, function (d) { return d.ts; })
                .enter().append("rect")
                .attr({
                    "class": (d) => { return typeof d.siso === "number" ? "bar-chart siso" : "bar-chart" },
                    "x": (d) => { return this.contextXscale(d.ts) - 0.5; },
                    "y": (d) => { return this.viewInnerHeight - this.padding.bottom - this.contextBarChartYscale(d.value.length); },
                    "height": (d) => { return this.contextBarChartYscale(d.value.length); },
                    "width": 1
                });

            // Context TimeLine here
            this.contextTimeLineG.append("g").attr("class", "brush")
                .append("rect")
                .attr({
                    "x": this.center[0] - (focusRegionWidth + scaleSize) * 0.5,
                    "width": focusRegionWidth,
                    "y": this.viewInnerHeight - this.contextTimeLineHeight - this.padding.bottom,
                    "height": this.contextTimeLineHeight
                });

            // Context TimeLine indicator
            let indicatorG = this.contextTimeLineG
                .append("g").attr("class", "indicator-group")
                .selectAll(".indicator")
                .data(tempL1A.outliersStatics, function (d) { return d.ts; })
                .enter().append("g")
                .attr({
                    "class": "indicator",
                    "transform": (d) => { return "translate(" + [this.contextXscale(d.ts), this.viewInnerHeight - this.padding.bottom + 2] + ")" }
                });

            indicatorG.append("rect")
                .attr({
                    "x": -8,
                    "width": 16,
                    "height": 9
                });

            indicatorG.selectAll("circle")
                .data(function (d) { return d.indicatorData; })
                .enter().append("circle")
                .attr({
                    "class": (d) => { return d ? d.type : "zero_"; },
                    "r": 2,
                    "cy": 4.5,
                    "cx": (d, i) => { return i * 5 - 5; },
                });

            this.contextTimeLineG
                .select(".indicator-group")
                .append("line")
                .attr({
                    "class": "move-indicator",
                    "x1": this.center[0],
                    "x2": this.center[0],
                    "y1": this.viewInnerHeight - this.contextTimeLineHeight - this.padding.bottom,
                    "y2": this.viewInnerHeight - this.padding.bottom,
                })
                .style({
                    "stroke": "red",
                    "stroke-width": "1px",
                    "stroke-opacity": 0.5
                });
            // context legend 
            this.contextTimeLineG
                .append("g").attr("class", "legend-group")
                .selectAll("text")
                .data([0, 1, 2, 3, 4])
                .enter().append("text")
                .attr({
                    "x": (d, i) => { let tempD = this.contextXscale.domain()[0].getTime() + (this.contextXscale.domain()[1].getTime() - this.contextXscale.domain()[0].getTime()) * i * 0.25; return this.contextXscale(tempD) - 7; },
                    "y": this.viewInnerHeight - this.padding.bottom + 10
                })
                .text((d, i) => {
                    let tempD = this.contextXscale.domain()[0].getTime() + (this.contextXscale.domain()[1].getTime() - this.contextXscale.domain()[0].getTime()) * i * 0.25; return this.dateFormat(new Date(tempD));
                });
        },
        InitView(timeLinePosition = null) {
            console.log("init view");
            this.animation && this.animation.interrupt();
            //clear
            this.focusTimeLineViewScale = 1;
            this.focusDataScale = 1;
            let videoData = this.clickData[this.selectedVideo];
            let tempL1A = videoData.clickDataGroupByTimeArray[1],
                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
            this.calOutLier(tempL1A);
            this.calOutLier(tempL2A);

            for (let i = 0, len = tempL1A.length; i < len; ++i) {
                tempL1A[i].firstDrop = true;
            }
            for (let i = 0, len = tempL2A.length; i < len; ++i) {
                tempL2A[i].firstDrop = true;
            }

            switch (timeLinePosition) {
                case "middle": {
                    this.contextTimeLineY = this.center[1] * 0.9;
                    this.$refs.bubbleFloatComponent
                        .setPosition(0, this.padding.bottom + 10)
                        .setSize([this.viewInnerWidth, this.height * 0.8]);
                    break;
                }
                case "down": {
                    this.contextTimeLineY = this.height * 0.8;
                    this.$refs.bubbleFloatComponent
                        .setPosition(0, 30)
                        .setSize([this.viewInnerWidth, this.height * 0.7]);
                    break;
                }
                default: {
                    this.contextTimeLineY = this.padding.top;
                    this.$refs.bubbleFloatComponent
                        .setPosition(0, this.viewInnerHeight + this.titleHeight)
                        .setSize([this.viewInnerWidth, this.height - this.viewInnerHeight]);
                }
            }

            this.zoomInView = [this.center[0], this.halfTimeLineHeight, this.viewInnerWidth];
            this.zoomOutView = [this.center[0], this.timeLineHeight, this.viewInnerWidth * 2];
            //modify the domain of xScale for focus view
            this.focusXscale
                .range([this.padding.left, this.width - this.padding.right])
                .domain([d3.time.hour.offset(this.xDomainMin, -5), d3.time.hour.offset(this.xDomainMin, 5)]);

            // clear the svg
            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
            this.svg.select("defs").selectAll("*").remove();

            this.drawFisheyeContextTimeLine(tempL1A);

            this.zoomIn = false;
            this.focusTimeLineViewScale = 1;

            let syncDelay = 0.3;
            this.$refs.bubbleFloatComponent
                .drawStackChart(timeLinePosition, this.selectedVideo)
                .start();
                
            this.animation = d3.select("svg.screen-scroll-svg");
            this.AnimationFisheyeTick(this.baseDuration);
        },
        AnimationUpdateDigitalClock(date) {
            if (!this.digitalClock) return;
            if (typeof date === "number" || typeof date === "string") date = new Date(date);
            this.digitalClock.select("text.date").text(this.dateFormat(date));
            this.digitalClock.select("text.time").text(this.timeFormat(date));
        },
        AnimationFisheyeTick(duration, ease = "linear") {
            let stop = false;
            this.animation.transition().duration(duration).ease(ease)
                .each("interrupt", () => {
                    console.log("interrupt");
                    this.contextTimeLineG.selectAll(".bar-chart").interrupt().transition();
                    this.contextTimeLineG.select(".time-line-chart").interrupt().transition();
                    this.contextTimeLineG.selectAll("circle.indicator").interrupt().transition();
                    this.contextTimeLineG.interrupt().transition();
                    this.contextTimeLineG.select(".legend-group").selectAll("text").interrupt().transition();
                    stop = true;
                })
                .each(() => {
                    // update the domains
                    let self = this;
                    let focusRegionWidth = this.focusRegionWidth;
                    let contextXscale = this.contextXscale;
                    let fisheyeScaleSize = this.focusRegionScale;
                    let barWidth = focusRegionWidth * 0.5 / fisheyeScaleSize;
                    let centerX = this.center[0];

                    let startLine = this.center[0] + 0.5 * focusRegionWidth;
                    let endLine = startLine - focusRegionWidth / fisheyeScaleSize;
                    let lastRange = this.contextXscale.range();
                    let moveRangeWidth = this.focusMoveRange;
                    let currentRange = [lastRange[0] - moveRangeWidth, lastRange[1] - moveRangeWidth];

                    // reach the end
                    if (currentRange[1] <= endLine) {
                        this.animation.interrupt();
                        this.$refs.bubbleFloatComponent.canBeFinished(true);
                        return;
                    }

                    this.contextTimeLineG.selectAll(".bar-chart")
                        .transition()
                        .tween("x", function (d) {
                            let interpolateRange = d3.interpolateNumber(0, moveRangeWidth);
                            let sX = contextXscale(d.ts) - 0.5;
                            return function (t) {
                                let tempX = sX - interpolateRange(t);
                                if (tempX < startLine) {
                                    if (tempX > endLine) {
                                        tempX = startLine - (0.5 + startLine - tempX) * fisheyeScaleSize;
                                        d3.select(this).attr("width", barWidth).attr("x", tempX);

                                        if (tempX < centerX && d.firstDrop) {
                                            d.firstDrop = false;
                                            self.$refs
                                                .bubbleFloatComponent
                                                .inputClicks(d.value, d)
                                                .drawClicks();
                                        }
                                    } else {
                                        tempX = tempX - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth;
                                        d3.select(this).attr("width", 1).attr("x", tempX);
                                    }
                                } else {
                                    d3.select(this).attr("width", 1).attr("x", tempX);
                                }
                            };
                        });

                    this.contextTimeLineG.select(".time-line-chart").select("path")
                        .transition()
                        .attrTween("d", (d, i, a) => {
                            let interpolateRange = d3.interpolateNumber(0, moveRangeWidth);
                            let lastOffset = 0;
                            return (t) => {
                                let offset = interpolateRange(t);
                                for (let i = 0; i < this.timelineChartData.length; ++i) {
                                    let d = this.timelineChartData[i];
                                    d.ox -= (offset - lastOffset);
                                    if (d.ox < startLine) {
                                        if (d.ox > endLine) {
                                            d.x = startLine - (startLine - d.ox) * fisheyeScaleSize;
                                        } else {
                                            d.x = d.ox - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth;
                                        }
                                    } else {
                                        d.x = d.ox;
                                    }
                                }
                                lastOffset = offset;
                                return this.timelineChartLineGen(this.timelineChartData);
                            }
                        });

                    this.contextTimeLineG
                        .transition()
                        .tween("centerTime", () => {
                            let interpolateRange = d3.interpolateNumber(0, moveRangeWidth);
                            return (t) => {
                                let offset = interpolateRange(t);
                                let tempX = startLine - (startLine - this.center[0]) / fisheyeScaleSize;
                                this.AnimationUpdateDigitalClock(this.contextXscale.invert(tempX + offset));
                                this.$refs.bubbleFloatComponent.AnimationUpdateDigitalClock(this.contextXscale.invert(tempX + offset));
                            }
                        });

                    // TODO the x-coordinate is not correct
                    let sY = this.viewInnerHeight - this.padding.bottom + 2;
                    this.contextTimeLineG.select("g.indicator-group").selectAll(".indicator")
                        .transition()
                        .tween("cx", function (d) {
                            let interpolateRange = d3.interpolateNumber(0, moveRangeWidth);
                            let sX = contextXscale(d.ts);

                            return function (t) {
                                let tempX = sX - interpolateRange(t);
                                if (tempX < startLine) {
                                    if (tempX > endLine) {
                                        d3.select(this)
                                            .attr("transform", "translate(" + [startLine - (0.875 + startLine - tempX) * fisheyeScaleSize, sY] + ")");

                                    } else {
                                        d3.select(this)
                                            .attr("transform", "translate(" + [tempX - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth, sY] + ")");
                                    }
                                } else {
                                    d3.select(this)
                                        .attr("transform", "translate(" + [tempX, sY] + ")");
                                }
                            };
                        });

                    this.contextTimeLineG.select(".legend-group").selectAll("text")
                        .transition()
                        .tween("x", (d, i) => {
                            let interpolateRange = d3.interpolateNumber(0, moveRangeWidth);
                            let sX = contextXscale.domain()[0].getTime() + (contextXscale.domain()[1].getTime() - contextXscale.domain()[0].getTime()) * i * 0.25;
                            sX = this.contextXscale(sX);
                            return function (t) {
                                let tempX = sX - interpolateRange(t);
                                if (tempX < startLine) {
                                    if (tempX > endLine) {
                                        d3.select(this).attr("x", startLine - (0.25 + startLine - tempX) * fisheyeScaleSize);
                                    } else {
                                        d3.select(this).attr("x", tempX - (1 - 1 / fisheyeScaleSize) * focusRegionWidth);
                                    }
                                } else {
                                    d3.select(this).attr("x", tempX);
                                }
                            };
                        });

                    this.contextXscale.range(currentRange);

                    let tempL1A = this.clickData[this.selectedVideo].clickDataGroupByTimeArray[this.focusTimeLineViewScale];
                    this.zoomIn = false;
                    for (let i = 0, len = tempL1A.outliers.length; i < len; ++i) {
                        let tempX = this.contextXscale(tempL1A.outliers[i].ts);//- moveRangeWidth;
                        if (tempX <= startLine && tempX > endLine) {
                            this.zoomIn = true;
                        }
                    }

                })
                .transition().duration(10)
                .each("end", () => {
                    if (!stop && this.focusXscale.domain()[1] < this.xDomainMax) {
                        if (this.isAcceleration && !this.zoomIn) {
                            switch (this.accelerateMode) {
                                case "domain": {
                                    this.focusTimeLineViewScale = this.zoomScaleMax;
                                    this.AccelerateByDomain(this.zoomScaleMax);
                                    this.$refs.bubbleFloatComponent.accelerateBallsDropping(this.zoomScaleMax);
                                    break;
                                }
                                case "screen": {
                                    this.zoomIn = true;
                                    this.focusDataScale = this.focusTimeLineViewScale = this.zoomScaleMax;
                                    this.zoomOutView = [this.zoomInView[0] + this.viewInnerWidth * 0.5,
                                        this.timeLineHeight,
                                        this.viewInnerWidth * this.focusTimeLineViewScale];
                                    this.AccelerateByScreen(duration, this.zoomInView, this.zoomOutView);
                                    break;
                                }
                            }
                        } else if (this.isAcceleration && this.zoomIn) {
                            switch (this.accelerateMode) {
                                case "domain": {
                                    this.focusTimeLineViewScale = 1;
                                    this.AccelerateByDomain(1);
                                    this.$refs.bubbleFloatComponent.accelerateBallsDropping(1)
                                    break;
                                }
                                case "screen": {
                                    this.zoomIn = false;
                                    this.focusDataScale = this.focusTimeLineViewScale = 1;
                                    this.zoomInView = [this.zoomOutView[0] + this.viewInnerWidth * 0.5,
                                        this.timeLineHeight * 0.5,
                                        this.viewInnerWidth * this.focusTimeLineViewScale];
                                    this.AccelerateByScreen(duration, this.zoomOutView, this.zoomInView);
                                    break;
                                }
                            }
                        } else {
                            this.AnimationFisheyeTick(duration);
                        }
                    }
                });
        },
        Pause() {
            console.log("pause");
            this.animation.interrupt();
            this.$refs.bubbleFloatComponent.pause();
        },
        Resume() {
            this.AnimationFisheyeTick(this.baseDuration);
            this.$refs.bubbleFloatComponent.resume();
        },
        AccelerateByDomain(scale) {
            let targetDuration = this.baseDuration / scale;
            let sourceDuration = this.baseDuration / (scale != 1 ? 1 : this.zoomScaleMax);
            let offset = (targetDuration - sourceDuration) * 0.2;
            if (this.currentDuration != targetDuration) this.currentDuration += offset;
            this.AnimationFisheyeTick(this.currentDuration);
        },
        AccelerateByScreen(duration, start, end) {
            console.log("accelerate by screen");
            this.animation.interrupt();
            this.selectVideoDisabled = true;
            let originalFocusXscale = this.focusXscale.copy();
            let halfScreen = end[2] * 0.5;
            this.focusXscale.domain([end[0] - halfScreen, end[0] + halfScreen].map(originalFocusXscale.invert));
            this.selectVideoDisabled = false;
            this.AnimationTick(duration);
        }
    }
}

