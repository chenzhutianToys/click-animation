<template src="./conglei-baseline.html"></template>
<script src="./conglei-baseline.js"></script>


<style>
    .conglei-svg .svg-background,
    .conglei .mdl-card__title {
        background-color: #81D4FA;
        fill: #81D4FA;
        /*background-color: #80D8FF;
        fill: #80D8FF;*/
    }
    
    .axis path,
    .axis line {
        fill: none;
    }
    
    .axis text {
        font-weight: 300;
        font-size: 15px;
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
    
    .time-line-context-group .axis path,
    .time-line-context-group .axis line {
        stroke-width: 2.5px;
        stroke: #E1F5FE;;
    }
    
    .time-line-context-group .axis circle{
        fill: #E1F5FE;
    }
</style>

<style scoped>
    .conglei {
        position: relative;
        height: 100%;
        width: 100%;
        background-color: #FAFAFA;
    }
    
    .conglei-svg {
        width: 100%;
        margin: 0px auto;
        position: relative;
        z-index: 2;
    }
</style>