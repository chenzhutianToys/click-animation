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

    clickData: null,
    data() {
        return {
            padding: { top: 0, right: 50, bottom: 30, left: 50 },
            width: null,
            height: null,
            center: null,
            titleHeight: null,
            viewInnerWidth: null,
            viewInnerHeight: null,
            contextTimeLineHeight: null,
            contextTimeLineY: null,
            stackBarChartHeight: 300,

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

            timeInterval: { name: "Hour", ms: 60 * 60 * 1000 }, // hour

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
            let extent = d3.extent(tempL1A, function(d) { return d.value.length; });
            let max = extent[1];
            let min = extent[0];
            let mean = d3.mean(tempL1A, function(d) { return d.value.length; });
            let median = d3.median(tempL1A, function(d) { return d.value.length; });
            let deviation = d3.deviation(tempL1A, function(d) { return d.value.length; });
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
            this.focusXscale.domain(d3.extent(tempL1A, function(d) { return +d.ts; }));
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
            this.svg = this.doc.select("svg.no-foreshadow-baseline-svg").attr("height", this.viewInnerHeight);
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
            this.timelineChartLineGen = d3.svg.line().interpolate("basis").x((d) => { return d.x; }).y((d) => { return d.y; });
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
        InitView(timeLinePosition = null) {
            if (this.animation) this.animation.interrupt();
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

            this.contextTimeLineY = this.padding.top;
            this.$refs.bubbleFloatComponent
                .setPosition(0, this.viewInnerHeight + this.titleHeight)
                .setSize([this.viewInnerWidth, this.height - this.viewInnerHeight]);

            this.zoomInView = [this.center[0], this.halfTimeLineHeight, this.viewInnerWidth];
            this.zoomOutView = [this.center[0], this.timeLineHeight, this.viewInnerWidth * 2];
            //modify the domain of xScale for focus view
            this.focusXscale
                .range([this.padding.left, this.width - this.padding.right])
                .domain([d3.time.hour.offset(this.xDomainMin, -5), d3.time.hour.offset(this.xDomainMin, 5)]);

            // clear the svg
            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
            this.svg.select("defs").selectAll("*").remove();

            this.drawContextTimeLine(tempL1A);

            this.zoomIn = false;
            this.focusTimeLineViewScale = 1;

            let syncDelay = 0.3;
            this.$refs.bubbleFloatComponent
                .drawNoStackChart( this.selectedVideo)
                .start()
                ;
            this.animation = d3.select("svg.no-foreshadow-baseline-svg");
            this.AnimationTick(this.baseDuration);
        },
        AnimationUpdateDigitalClock(date) {
            if (!this.digitalClock) return;
            if (typeof date === "number" || typeof date === "string") date = new Date(date);
            this.digitalClock.select("text.date").text(this.dateFormat(date));
            this.digitalClock.select("text.time").text(this.timeFormat(date));
        },
        drawContextTimeLine(tempL1A) {
            this.contextXscale.range([this.padding.left, this.width - this.padding.right]);
            this.contextTimeLineG = this.svg.append("g")
                .attr("class", "time-line-context-group")
                .attr("transform", "translate(" + [0, 0] + ")");

            this.brush
                .x(this.contextXscale)
                .extent(this.focusXscale.domain());
            // Context TimeLine here
            this.contextTimeLineG.append("g").attr("class", "x brush")
                .on("mousedown", function() { d3.event.stopImmediatePropagation(); })
                .call(this.brush)
                .style("pointer-events", "none")
                .selectAll("rect")
                .attr({
                    "y": this.viewInnerHeight - this.padding.bottom - this.contextTimeLineHeight,
                    "height": this.contextTimeLineHeight
                });

            this.contextTimeLineXAxis = this.contextTimeLineG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + [0, this.viewInnerHeight - this.padding.bottom] + ")");

            this.contextTimeLineXAxis.call(d3.svg.axis()
                .scale(this.contextXscale)
                .orient("top")
                .tickSize(6, 0)
                .tickFormat(function(d) { return d3.time.format("%b %d")(d); }));

            this.contextTimeLineXAxis
                .append("circle")
                .attr({
                    'cx': this.contextXscale.range()[0],
                    'r': 10,
                    'class': 'time-pivot'
                });
        },
        AddOffsetToDomain(xScale) {
            let domain = xScale.domain();
            let domainWidth = 0.2 * (domain[1].getTime() - domain[0].getTime());
            let tempDomainMin = domain[0].getTime() + domainWidth,
                tempDomainMax = domain[1].getTime() + domainWidth;
            if (tempDomainMax > this.xDomainMax) { //limit to the max
                tempDomainMin = domain[0];
                tempDomainMax = domain[1];
            }
            return [tempDomainMin, tempDomainMax];
        },
        AnimationTick(duration) {
            let stop = false;
            this.animation.transition().duration(duration).ease("linear")
                .each("interrupt", () => {
                    console.log("interrupt");
                    stop = true;
                })
                .each(() => {
                    // update the domains               
                    let lastDomain = this.focusXscale.domain();
                    let lastDomainCenter = lastDomain[0].getTime() + 0.5 * (lastDomain[1].getTime() - lastDomain[0].getTime());
                    let currentDomain = this.AddOffsetToDomain(this.focusXscale);
                    let currentDomainCenter = currentDomain[0] + 0.5 * (currentDomain[1] - currentDomain[0]);

                    // 1.determine the position of each bar firstly
                    let focusBarData = [];
                    let targetData = this.clickData[this.selectedVideo].clickDataGroupByTimeArray[1];
                    this.zoomIn = false;
                    for (let i = 0, len = targetData.length; i < len; ++i) {
                        if (targetData[i].ts >= lastDomain[0]) {
                            if (targetData[i].ts <= currentDomain[1]) {
                                if (targetData[i].isOutlier) {
                                    this.zoomIn = true;
                                }
                                focusBarData.push(targetData[i]);
                            } else {
                                break;
                            }
                        }
                    }

                    d3.select({}).transition().tween("main", () => {
                        let interpolateDomain = d3.interpolateNumber(lastDomainCenter, currentDomainCenter);
                        return (t) => {
                            if (stop) return;
                            let offset = interpolateDomain(t);
                            this.$refs.bubbleFloatComponent.AnimationUpdateDigitalClock(offset);
                            this.contextTimeLineXAxis.select("circle").attr("cx", this.contextXscale(offset));

                            for (let i = 0, len = focusBarData.length; i < len; ++i) {
                                if (focusBarData[i].ts > offset) {
                                    if (focusBarData[i].firstDrop) {
                                        focusBarData[i].firstDrop = false;
                                        this.$refs
                                            .bubbleFloatComponent
                                            .inputClicks(focusBarData[i].value, focusBarData[i])
                                            .drawClicks();
                                    }
                                }
                            }
                        };
                    });

                    // 2.update new domain
                    this.focusXscale.domain(currentDomain);
                    // 3.define our brush extent with new domain
                    this.brush.extent(currentDomain);
                    this.brush(this.contextTimeLineG.select(".x.brush").transition());
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
                                    this.focusTimeLineViewScale = this.zoomScaleMax;
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
                                    this.focusTimeLineViewScale = 1;
                                    this.zoomInView = [this.zoomOutView[0] + this.viewInnerWidth * 0.5,
                                        this.timeLineHeight * 0.5,
                                        this.viewInnerWidth * this.focusTimeLineViewScale];
                                    this.AccelerateByScreen(duration, this.zoomOutView, this.zoomInView);
                                    break;
                                }
                            }
                        } else {
                            this.AnimationTick(duration);
                        }
                    }
                });
        },


        Pause() {
            this.animation.interrupt();
            this.$refs.bubbleFloatComponent.pause();
        },
        Resume() {
            this.AnimationTick(this.baseDuration);
            this.$refs.bubbleFloatComponent.resume();
        },
        AccelerateByDomain(scale) {
            let targetDuration = this.baseDuration / scale;
            let sourceDuration = this.baseDuration / (scale != 1 ? 1 : this.zoomScaleMax);
            let offset = (targetDuration - sourceDuration) * 0.2;
            if (this.currentDuration != targetDuration) this.currentDuration += offset;
            this.AnimationTick(this.currentDuration);
        },
        AccelerateByScreen(duration, start, end) {
            this.animation.interrupt();
            this.selectVideoDisabled = true;
            let originalFocusXscale = this.focusXscale.copy();
            let halfScreen = end[2] * 0.5;
            this.focusXscale.domain([end[0] - halfScreen, end[0] + halfScreen].map(originalFocusXscale.invert));
            this.selectVideoDisabled = false;
            this.AnimationTick(duration);
        },


    }
}

