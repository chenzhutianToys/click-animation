<template src="./no-ball-drop.html"></template>

<script src="./no-ball-drop.js"></script>

<style>
    .screen-scroll-svg .svg-background,
    .screen-scroll .mdl-card__title {
        background-color: #81D4FA;
        fill: #81D4FA;
        /*background-color: #80D8FF;
        fill: #80D8FF;*/
    }
    
    .brush rect {
        fill-opacity: .125;
    }
    
    .legend-group text {
        dominant-baseline: hanging;
        font-size: 15px;
        font-weight: 300;
    }
    
    rect.bar-chart {
        fill: #E1F5FE;
    }
    /*rect.bar-chart.siso{
        fill: red;
    }*/
    
    .indicator circle {
        stroke: #fff;
        fill: #fff;
        stroke-width: 0.7px;
    }
    
    .indicator rect {
        stroke: #fff;
        stroke-width: 0.5px;
        fill: #fff;
        fill-opacity: 0.5;
    }
    
    .time-line-chart path {
        fill: none;
        stroke: #03A9F4;
        stroke: 1px;
    }
</style>

<style scoped>
    .screen-scroll {
        position: relative;
        height: 100%;
        width: 100%;
        background-color: #FAFAFA;
    }
    
    .screen-scroll-svg {
        width: 100%;
        margin: 0px auto;
        position: relative;
        z-index: 2;
    }
</style>