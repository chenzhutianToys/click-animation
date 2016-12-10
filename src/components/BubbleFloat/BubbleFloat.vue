<template>
    <div class="bubble-float"></div>
</template>


<script src="./bubble-float.js"></script>

<style>
    .clock-group text.date,
    .clock-group text.time {
        font-weight: 300;
        font-size: 7vh;
        fill: #757575;
    }
    
    .timeline.axis line,
    .clock-group line {
        stroke-width: 2.5px;
        stroke: #FF7043;
    }
    
    .analog-clock .clockface{
        fill: #FAFAFA;
        stroke: #757575;
        stroke-width: 5;
    }
    
    .analog-clock .centerdot{
        fill:#fff;
        stroke: #FEBE12;
        stroke-width: 2;
    }
    
    .analog-clock .clockhand{
        stroke-linecap:round;
        stroke-linejoin:round;
        fill:none;
    }
    
    .timeline.axis text {
        font-weight: 300;
        font-size: 2vh;
        color: #757575;
    }
    
    .axis path,
    .line {
        fill: none;
    }
    
    .legend text,
    .tick text {
        font-size: 15px;
        font-weight: 300;
    }
    
    .axis text.caption {
        font-size: 20px;
        font-weight: 400;
    }
    
    .axis text.caption.vertical-caption {
        -webkit-transform: rotate(-90deg);
        -moz-transform: rotate(-90deg);
        -ms-transform: rotate(-90deg);
        -o-transform: rotate(-90deg);
        transform: rotate(-90deg);
    }
    
    .axis text::selection {
        background: none;
    }
    
    .bubble-float {
        position: absolute;
        margin: 0px auto;

    }
    
    .bubble-float-chart,
    .bubble-float-svg {
        position: relative;
    }
    
    .bubble-float-canvas {
        position: absolute;
        top: 0;
        left: 0;
    }
    
    .back-ground .layer-border path {
        fill: none;
        stroke: #fff;
        stroke-width: 1px;
    }
    
    .back-ground .layer rect,
    .back-ground .layer path {
        fill-opacity: 0.3;
    }
</style>