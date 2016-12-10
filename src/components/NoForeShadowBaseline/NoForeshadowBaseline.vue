<template src="./no-foreshadow-baseline.html"></template>

<script src="./no-foreshadow-baseline.js"></script>

<style>
    .no-foreshadow-baseline-svg .svg-background,
    .no-foreshadow-baseline .mdl-card__title {
        background-color: #81D4FA;
        fill: #81D4FA;
    }
        
    .legend-group text {
        dominant-baseline: hanging;
        font-size: 15px;
        font-weight: 300;
    }
    

</style>

<style scoped>
    .no-foreshadow-baseline {
        position: relative;
        height: 100%;
        width: 100%;
        background-color: #FAFAFA;
    }
    
    .no-foreshadow-baseline-svg {
        width: 100%;
        margin: 0px auto;
        position: relative;
        z-index: 2;
    }
</style>