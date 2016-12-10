import d3 from "d3";

const TWOPI = Math.PI * 2;
const BASECIRCLERADIUS = 35;
var TIMELINEUIDGEN = -1;
export default class {

    /**
     * @param  {d3-selection} backCanvas
     * @param  {d3-selection} frontCanvas
     * @param  {number} timeLineHeight
     */
    constructor(backCanvas, frontCanvas, timeLineHeight) {
        // init variables      
        this.backCanvas = backCanvas;
        this.frontCanvas = frontCanvas
        this.width = +this.backCanvas.attr("width");
        this.height = +this.backCanvas.attr("height");
        this.center = [this.width * 0.5, this.helght * 0.5];
        this.timeLineHeight = timeLineHeight;
        this.halfTimeLineHeight = timeLineHeight * 0.5;

        // default value for variables;
        this.frontContext = this.frontCanvas.node().getContext("2d");
        this.backContext = this.backCanvas.node().getContext("2d");
        this.timeFormat = d3.time.format("%b.%d,%H");
        //this.dotsNum = 10;
        //this.dotPadding = 10;
        this.skewLinePerDot = 20;
        //this.skewLineNum = this.dotsNum * this.skewLinePerDot;
        //this.skewLinePadding = 1;
        this.circleRadius = BASECIRCLERADIUS;
        this.dotRadius = 2;
        this.distToSplit = 30;
        this.dropBalls = true;

        // private variables
        this._id = ++TIMELINEUIDGEN;
        this._timeLineData = null;

        this.testTick = 0;
    }
    /**
     * @param  {Function} drawFunc
     * @param  {Array<any>} parameters
     * @param  {number} x=undefined
     * @param  {number} y=undefined
     * @param  {number} scale=undefined
     */
    DrawUsingCustom(drawFunc, parameters, x = undefined, y = undefined, scale = undefined) {

        this.backContext.clearRect(0, 0, this.width, this.height);
        this.frontContext.clearRect(0, 0, this.width, this.height);

        let transform = d3.transform(this.backCanvas.attr("transform"));
        let tx = typeof x === "number" ? x : 0;
        let ty = typeof y === "number" ? y : 0;
        let ts = typeof scale === "number" ? scale : 1;

        this.backContext.save();
        this.backContext.translate(tx + transform.translate[0], ty + transform.translate[1]);
        this.backContext.scale(ts * transform.scale[0], ts * transform.scale[1]);

        this.frontContext.save();
        this.frontContext.translate(tx + transform.translate[0], ty + transform.translate[1]);
        this.frontContext.scale(ts * transform.scale[0], ts * transform.scale[1]);

        let splitResult = drawFunc.apply(this, parameters);

        this.backContext.restore();
        this.frontContext.restore();

        return splitResult;
    }

    /**
     * @param  {Array<number>} dotsXPosition
     * @param  {Array<number>} dotsYPosition
     * @param  {number} id
     */
    DrawTimeLine(dotsXPosition, circlesData, xOffset = 0, yOffset = 0, splitBalls = undefined) {
        let drawer = function(dotsXPosition, circlesData, xOffset, yOffset, splitBalls) {
            if (!dotsXPosition || !Array.isArray(dotsXPosition)) return;

            let timeLineData = this._timeLineData || {};

            let dotsNum = dotsXPosition.length;
            let dotPadding = (dotsXPosition[dotsXPosition.length - 1] - dotsXPosition[0]) / (dotsNum - 1);
            let skewLineNum = dotsNum * this.skewLinePerDot;
            let skewLinePadding = dotPadding / this.skewLinePerDot;

            this.AtomDrawSkewLines(dotsXPosition, skewLineNum, skewLinePadding, xOffset);
            this.AtomDrawLinks(dotsXPosition);
            let resultObj = this.AtomDrawCircles(circlesData, xOffset, yOffset, splitBalls);
            let lineWidth = resultObj.circleLineWidth;

            let maxHeight = d3.max(circlesData),
                maxWidth = d3.max(dotsXPosition);

            timeLineData.x = 0;
            timeLineData.y = this.halfTimeLineHeight - this.circleRadius - lineWidth;
            timeLineData.width = this.width + lineWidth * 2 + maxWidth;
            timeLineData.height = (this.circleRadius + lineWidth) * 2 + maxHeight;
            timeLineData.dotsXPosition = dotsXPosition;
            timeLineData.dotsYPosition = circlesData;
            this._timeLineData = timeLineData;

            return resultObj.splitBallsFinished;
        }

        let newDrawer = function(dotsXPosition, circlesData, xOffset, yOffset, splitBalls) {
            if (!dotsXPosition || !Array.isArray(dotsXPosition)) return;
            let timeLineData = this._timeLineData || {};

            // link line
            let end = dotsXPosition[dotsXPosition.length - 1];
            this.backContext.lineWidth = 8;
            this.backContext.strokeStyle = "rgb(73,75,87)";
            this.backContext.lineWidth = 8;
            this.backContext.beginPath();
            this.backContext.moveTo(0, this.halfTimeLineHeight);
            this.backContext.lineTo(end, this.halfTimeLineHeight);
            this.backContext.stroke();

            let resultObj = this.NewAtomDrawCircles(circlesData, xOffset, yOffset, splitBalls);
            let lineWidth = resultObj.circleLineWidth;

            let maxHeight = d3.max(circlesData),
                maxWidth = d3.max(dotsXPosition);

            timeLineData.x = 0;
            timeLineData.y = this.halfTimeLineHeight - this.circleRadius - lineWidth;
            timeLineData.width = this.width + lineWidth * 2 + maxWidth;
            timeLineData.height = (this.circleRadius + lineWidth) * 2 + maxHeight;
            timeLineData.dotsXPosition = dotsXPosition;
            timeLineData.dotsYPosition = circlesData;
            this._timeLineData = timeLineData;

            return resultObj.splitBallsFinished;
        };

        return this.DrawUsingCustom(newDrawer, [dotsXPosition, circlesData, xOffset, yOffset, splitBalls]);
        //return this.DrawUsingCustom(drawer, [dotsXPosition, circlesData, xOffset, yOffset, splitBalls]);
    }

    setDistToSplit(d) {
        if (typeof d === "number") {
            this.distToSplit = d;
        }
        return this;
    }

    setDropBalls(t) {
        if (typeof t === "boolean") {
            this.dropBalls = t;
        }

        return this;
    }


    NewAtomDrawCircles(circlesData, xOffset = 0, yOffset = 0, splitBalls = undefined) {
        // Circle
        let circleLineWidth = 5;
        let circleNum = circlesData.length;
        this.frontContext.lineWidth = 5;
        this.frontContext.strokeStyle = "rgb(73,75,87)";
        this.frontContext.fillStyle = "rgb(204,110,76)";//"rgb(233, 30, 99)";//"rgb(199,166,63)";
        this.frontContext.beginPath();

        for (let i = 0; i < circleNum; ++i) {
            if (this.dropBalls && !circlesData[i].firstDrop) continue;
            this.frontContext
                .moveTo(circlesData[i].x + this.circleRadius - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
            this.frontContext
                .arc(circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset),
                this.circleRadius,
                0,
                TWOPI);
        }
        this.frontContext.fill();
        this.frontContext.stroke();

        //text
        this.frontContext.fillStyle = "#fff"; //"rgb(73,75,87)";
        this.frontContext.font = "25px Segoe UI Light";//"28px Arial Black";
        this.frontContext.textBaseline = "middle";
        this.frontContext.textAlign = "center";
        this.frontContext.beginPath();
        for (let i = 0; i < circleNum; ++i) {
            if (this.dropBalls && !circlesData[i].firstDrop) continue;
            this.frontContext
                .fillText(this.timeFormat(new Date(circlesData[i].ts)),
                circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
        }
        this.frontContext.fill();


        let splitBallsFinished = false;
        if (splitBalls) {

            let dist = 0;
            for (let i = 0, len = splitBalls.length; i < len; ++i) {
                let ball = splitBalls[i];
                this.frontContext.fillStyle = ball.color;
                this.frontContext.beginPath();
                this.frontContext
                    .moveTo(ball.x + ball.r,
                    this.halfTimeLineHeight + ball.y);
                this.frontContext
                    .arc(ball.x,
                    this.halfTimeLineHeight + ball.y,
                    ball.r,
                    0,
                    TWOPI);

                let tx = ball.x + (ball.x - ball.px) * 0.9;
                ball.px = ball.x;
                ball.x = tx;
                dist += Math.abs(ball.px - ball.x);

                let ty = ball.y + (ball.y - ball.py) * 0.9;
                ball.py = ball.y;
                ball.y = ty;
                this.frontContext.fill();

            }
            this.testTick++;
            if (dist < (1 * splitBalls.length)) {
                splitBallsFinished = true;
                console.log("tick time:" + this.testTick);
                this.testTick = 0;
            }
        }

        return { 'circleLineWidth': circleLineWidth, 'splitBallsFinished': splitBallsFinished };
    }

    /**
     * @param  {Array<number>} dotsXPosition
     * @returns {(t)=>void} callBack function for d3-tween
     */
    AnimationInitTimeLine(dotsXPosition) {
        let dotsNum = dotsXPosition.length;
        let dotPadding = (dotsXPosition[dotsXPosition.length - 1].x - dotsXPosition[0].x) / (dotsNum - 1);
        let dotDelay = 1 / dotsNum;

        let skewLineNum = dotsNum * this.skewLinePerDot;
        let skewLinePadding = dotPadding / this.skewLinePerDot;
        let skewLineDelay = 1 / skewLineNum;

        let start = dotsXPosition[0].x;
        let end = dotsXPosition[dotsXPosition.length - 1].x;
        let i = 0,
            j = 0;

        let transform = d3.transform(this.backCanvas.attr("transform"));

        let newCallBack = function(t) {
            this.backContext.save();
            this.frontContext.save();
            this.backContext.translate(transform.translate[0], transform.translate[1]);
            this.frontContext.translate(transform.translate[0], transform.translate[1]);

            //circle
            while (t > j * dotDelay) {
                if (dotsXPosition[j].empty) {
                    ++j;
                    continue;
                }

                this.frontContext.lineWidth = 5;
                this.frontContext.strokeStyle = "rgb(73,75,87)";
                this.frontContext.fillStyle = "rgb(204,110,76)";//"rgb(233, 30, 99)";//"rgb(199,166,63)";
                this.frontContext.beginPath();
                this.frontContext.moveTo(dotsXPosition[j].x + this.circleRadius, this.halfTimeLineHeight);
                this.frontContext.arc(dotsXPosition[j].x, this.halfTimeLineHeight, this.circleRadius, 0, TWOPI);
                this.frontContext.fill();
                this.frontContext.stroke();

                //text
                this.frontContext.fillStyle = "#fff";//"rgb(73,75,87)";
                this.frontContext.font = "28px Segoe UI Light";//"28px Arial Black";
                this.frontContext.textBaseline = "middle";
                this.frontContext.textAlign = "center";
                this.frontContext.beginPath();
                this.frontContext.fillText(this.timeFormat(dotsXPosition[j].ts), dotsXPosition[j].x, this.halfTimeLineHeight);
                this.frontContext.fill();
                ++j;
            }

            // link line
            let tempEnd = this.width * t;
            this.backContext.lineWidth = 8;
            this.backContext.strokeStyle = "rgb(73,75,87)";
            this.backContext.lineWidth = 8;
            this.backContext.beginPath();
            this.backContext.moveTo(0, this.halfTimeLineHeight);
            this.backContext.lineTo(tempEnd, this.halfTimeLineHeight);
            this.backContext.stroke();

            this.backContext.restore();
            this.frontContext.restore();
        };


        let callBack = function(t) {
            this.backContext.save();
            this.frontContext.save();
            this.backContext.translate(transform.translate[0], transform.translate[1]);
            this.frontContext.translate(transform.translate[0], transform.translate[1]);

            // skewLine
            while (t > i * skewLineDelay) {
                this.backContext.strokeStyle = "#D90429";
                this.backContext.fillStyle = "#D90429";
                this.backContext.lineWidth = 0.5;

                let x = start + i * skewLinePadding;
                this.backContext.beginPath();

                this.backContext.moveTo(x + skewLinePadding, this.halfTimeLineHeight);
                this.backContext.lineTo(x, this.timeLineHeight);

                if ((i & 3) === 0) {
                    this.backContext.moveTo(x + skewLinePadding, this.halfTimeLineHeight);
                    this.backContext.arc(x + skewLinePadding, this.halfTimeLineHeight, this.dotRadius, 0, TWOPI);
                }

                this.backContext.fill();
                this.backContext.stroke();
                ++i;
            }

            // Circle
            while (t > j * dotDelay) {
                if (dotsXPosition[j].empty) {
                    ++j;
                    continue;
                }

                this.frontContext.lineWidth = 5;
                this.frontContext.strokeStyle = "rgb(221, 196, 207)";
                this.frontContext.fillStyle = "rgb(233,243,246)";
                this.frontContext.beginPath();
                this.frontContext.moveTo(dotsXPosition[j].x + this.circleRadius, this.halfTimeLineHeight);
                this.frontContext.arc(dotsXPosition[j].x, this.halfTimeLineHeight, this.circleRadius, 0, TWOPI);
                this.frontContext.fill();
                this.frontContext.stroke();

                // text
                this.frontContext.fillStyle = "#D90429";
                this.frontContext.font = "28px Arial Black";
                this.frontContext.textBaseline = "middle";
                this.frontContext.textAlign = "center";
                this.frontContext.beginPath();
                this.frontContext.fillText(this.timeFormat(dotsXPosition[j].ts), dotsXPosition[j].x, this.halfTimeLineHeight);
                this.frontContext.fill();
                ++j;
            }

            let tempEnd = this.width * t;
            // link
            this.backContext.lineWidth = 1;
            this.backContext.strokeStyle = "rgb(221, 196, 207)";
            this.backContext.beginPath();
            this.backContext.moveTo(0, 0);
            this.backContext.lineTo(tempEnd, 0);
            this.backContext.moveTo(0, this.timeLineHeight);
            this.backContext.lineTo(tempEnd, this.timeLineHeight);
            this.backContext.stroke();

            this.backContext.restore();
            this.frontContext.restore();

        };

        return newCallBack.bind(this);
    }

    AnimationAggregateCircles(startCirclesData, endCirclesData, scale) {
        let transform = d3.transform(this.backCanvas.attr("transform"));
        let targetR = BASECIRCLERADIUS * scale;
        let startGap, endGap;
        if (startCirclesData[1] && endCirclesData[1]) {
            startGap = startCirclesData[1].ts - startCirclesData[0].ts;
            endGap = endCirclesData[1].ts - endCirclesData[0].ts;
        }


        let sourceCirclesData, targetCirclesData;
        if (startGap > endGap) {
            sourceCirclesData = endCirclesData;
            targetCirclesData = startCirclesData;
        } else {
            sourceCirclesData = startCirclesData;
            targetCirclesData = endCirclesData;
        }
        for (let i = 0, len = sourceCirclesData.length; i < len; ++i) {
            let circle = sourceCirclesData[i];
            let insideIndex = -1;
            while (targetCirclesData[++insideIndex] && targetCirclesData[insideIndex].ts < circle.ts);
            if (--insideIndex < 0) insideIndex = 0;

            if (startGap > endGap) {
                circle.aggregate = {
                    sx: targetCirclesData[insideIndex].x,
                    ex: circle.x
                };
            } else {
                circle.aggregate = {
                    sx: circle.x,
                    ex: targetCirclesData[insideIndex].x
                };
            }
        }

        let newCallback = (t) => {
            this.frontContext.clearRect(0, this.height * 0.2, this.width, this.height * 0.8);
            this.frontContext.save();
            this.frontContext.translate(transform.translate[0], transform.translate[1]);
            this.frontContext.scale(transform.scale[0], transform.scale[1]);

            let circleLineWidth = 5;
            let circleNum = sourceCirclesData.length;
            this.frontContext.lineWidth = 5;
            this.frontContext.strokeStyle = "rgb(73,75,87)";
            this.frontContext.fillStyle = "rgb(204,110,76)";//"rgb(233, 30, 99)";//"rgb(199,166,63)";
            this.frontContext.beginPath();
            for (let i = 0; i < circleNum; ++i) {
                let circle = sourceCirclesData[i];
                if (!circle.firstDrop) continue;
                this.frontContext
                    .moveTo(circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t + this.circleRadius + (targetR - this.circleRadius) * t,
                    this.halfTimeLineHeight + circle.y);
                this.frontContext
                    .arc(circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t,
                    this.halfTimeLineHeight,
                    this.circleRadius + (targetR - this.circleRadius) * t,
                    0,
                    TWOPI);
            }
            this.frontContext.fill();
            this.frontContext.stroke();

            //text
            this.frontContext.fillStyle = "#fff";//"rgb(73,75,87)";
            this.frontContext.font = "28px Segoe UI Light";//"28px Arial Black";
            this.frontContext.textBaseline = "middle";
            this.frontContext.textAlign = "center";
            this.frontContext.beginPath();
            for (let i = 0; i < circleNum; ++i) {
                let circle = sourceCirclesData[i];
                if (!circle.firstDrop) continue;
                this.frontContext
                    .fillText(this.timeFormat(new Date(circle.ts)),
                    circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t,
                    this.halfTimeLineHeight + circle.y);
            }
            this.frontContext.fill();

            if (t === 1) {
                this.circleRadius = targetR;
            }
            this.frontContext.restore();

        };

        let callBack = (t) => {
            this.frontContext.clearRect(0, this.height * 0.2, this.width, this.height * 0.8);
            this.frontContext.save();
            this.frontContext.translate(transform.translate[0], transform.translate[1]);
            this.frontContext.scale(transform.scale[0], transform.scale[1]);

            let circleLineWidth = 5;
            let circleNum = sourceCirclesData.length;
            this.frontContext.lineWidth = circleLineWidth;
            this.frontContext.strokeStyle = "rgb(221, 196, 207)";
            this.frontContext.fillStyle = "rgb(233,243,246)";
            this.frontContext.beginPath();
            for (let i = 0; i < circleNum; ++i) {
                let circle = sourceCirclesData[i];
                if (!circle.firstDrop) continue;
                this.frontContext
                    .moveTo(circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t + this.circleRadius + (targetR - this.circleRadius) * t,
                    this.halfTimeLineHeight + circle.y);
                this.frontContext
                    .arc(circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t,
                    this.halfTimeLineHeight,
                    this.circleRadius + (targetR - this.circleRadius) * t,
                    0,
                    TWOPI);
            }
            this.frontContext.fill();
            this.frontContext.stroke();

            // text
            this.frontContext.fillStyle = "#D90429";
            this.frontContext.font = "28px Arial Black";
            this.frontContext.textBaseline = "middle";
            this.frontContext.textAlign = "center";
            this.frontContext.beginPath();
            for (let i = 0; i < circleNum; ++i) {
                let circle = sourceCirclesData[i];
                if (!circle.firstDrop) continue;
                this.frontContext
                    .fillText(this.timeFormat(new Date(circle.ts)),
                    circle.aggregate.sx + (circle.aggregate.ex - circle.aggregate.sx) * t,
                    this.halfTimeLineHeight + circle.y);
            }
            this.frontContext.fill();

            if (t === 1) {
                this.circleRadius = targetR;
            }
            this.frontContext.restore();
        };

        return newCallback.bind(this);
        // return callBack.bind(this);
    }

    /**
     * @param  {Array<number>} dotsXPosition
     */
    AtomDrawSkewLines(dotsXPosition, skewLineNum, skewLinePadding, xOffset = 0) {
        this.backContext.strokeStyle = "#D90429";
        this.backContext.fillStyle = "#D90429";
        this.backContext.lineWidth = 0.5;
        this.backContext.beginPath();
        for (let i = 0; i < skewLineNum; ++i) {

            let tempX = dotsXPosition[0] + i * skewLinePadding;
            this.backContext.moveTo(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight);
            this.backContext.lineTo(tempX - xOffset, this.timeLineHeight);

            if ((i & 3) == 0) {
                this.backContext.moveTo(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight);
                this.backContext.arc(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight, this.dotRadius, 0, TWOPI);
            }

        }
        this.backContext.fill();
        this.backContext.stroke();

    }

    /**
     * @param  {Array<number>} dotsXPosition
     * @param  {Array<number>} dotsYPosition
     */
    AtomDrawCircles(circlesData, xOffset = 0, yOffset = 0, splitBalls = undefined) {

        // Circle
        let circleLineWidth = 5;
        let circleNum = circlesData.length;
        this.frontContext.lineWidth = circleLineWidth;
        this.frontContext.strokeStyle = "rgb(221, 196, 207)";
        this.frontContext.fillStyle = "rgb(233,243,246)";
        this.frontContext.beginPath();

        for (let i = 0; i < circleNum; ++i) {
            if (!circlesData[i].firstDrop) continue;
            this.frontContext
                .moveTo(circlesData[i].x + this.circleRadius - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
            this.frontContext
                .arc(circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset),
                this.circleRadius,
                0,
                TWOPI);
        }
        this.frontContext.fill();
        this.frontContext.stroke();

        // text
        this.frontContext.fillStyle = "#D90429";
        this.frontContext.font = "28px Arial Black";
        this.frontContext.textBaseline = "middle";
        this.frontContext.textAlign = "center";
        this.frontContext.beginPath();
        for (let i = 0; i < circleNum; ++i) {
            if (!circlesData[i].firstDrop) continue;
            this.frontContext
                .fillText(this.timeFormat(new Date(circlesData[i].ts)),
                circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset),
                this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
        }
        this.frontContext.fill();

        let splitBallsFinished = false;
        if (splitBalls) {

            let dist = 0;
            for (let i = 0, len = splitBalls.length; i < len; ++i) {
                let ball = splitBalls[i];
                this.frontContext.fillStyle = ball.color;
                this.frontContext.beginPath();
                this.frontContext
                    .moveTo(ball.x + ball.r,
                    this.halfTimeLineHeight + ball.y);
                this.frontContext
                    .arc(ball.x,
                    this.halfTimeLineHeight + ball.y,
                    ball.r,
                    0,
                    TWOPI);

                let tx = ball.x + (ball.x - ball.px) * 0.9;
                ball.px = ball.x;
                ball.x = tx;
                dist += Math.abs(ball.px - ball.x);

                let ty = ball.y + (ball.y - ball.py) * 0.9;
                ball.py = ball.y;
                ball.y = ty;
                this.frontContext.fill();

            }
            this.testTick++;
            if (dist < (1 * splitBalls.length)) {
                splitBallsFinished = true;
                console.log("tick time:" + this.testTick);
                this.testTick = 0;
            }
        }

        return { 'circleLineWidth': circleLineWidth, 'splitBallsFinished': splitBallsFinished };
    }

    /**
     * @param  {Array<number>} dotsXPosition
     */
    AtomDrawLinks(dotsXPosition) {
        let end = dotsXPosition[dotsXPosition.length - 1];
        // link
        this.backContext.lineWidth = 1;
        this.backContext.strokeStyle = "rgb(221, 196, 207)";
        this.backContext.beginPath();
        this.backContext.moveTo(0, 0);
        this.backContext.lineTo(end, 0);
        this.backContext.moveTo(0, this.timeLineHeight);
        this.backContext.lineTo(end, this.timeLineHeight);
        this.backContext.stroke();
    }

    /**
     * @param  {number} id
     */
    GetDotsYPosition() {
        return this._timeLineData && this._timeLineData.dotsYPosition;
    }


    ClearCanvas() {
        this.circleRadius = BASECIRCLERADIUS;
        this.backContext.clearRect(0, 0, this.width, this.height);
        this.frontContext.clearRect(0, 0, this.width, this.height);
        this.backContext.setTransform(1, 0, 0, 1, 0, 0);
        this.frontContext.setTransform(1, 0, 0, 1, 0, 0);
    }

}