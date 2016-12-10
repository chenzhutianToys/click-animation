<template src="./app.html"></template>

<script src="./app.js"></script>

<style>
    body {
        background: #ebeff2;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    
    text {
        text-anchor: middle;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    .pause {
        fill: #FFC107 !important;
    }
    
    .play {
        fill: #80CBC4 !important;
    }
    
    .seeked {
        fill: #03A9F4 !important;
    }
    
    .error {
        fill: #607D8B !important;
    }
    
    .ratechange {
        fill: #00BCD4 !important;
    }
    
    .stalled {
        fill: #EF5350 !important;
    }
</style>

<style scoped>
    .page-content {
        margin: 0px auto;
        /*width:76.8vw;
        height:43.2vw;*/
        width: 80vw;
        height: 45vw;
        /*width: 64vw;
        height: 36vw;*/
        /*width: 48vw;
        height: 27vw;*/
    }
    
    .mdl-button {
        width: 100%;
    }
</style>