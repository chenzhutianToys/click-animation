'use strict'
var fs = require('fs');

var dataPath = "./";
var animation_All17 = "animation_All17.json";
var typeCount_noDiff = "typeCount_noDiff.json";

fs.readFile(dataPath + animation_All17, 'utf8', function (err, data) {
    if (err) throw err;
    data = JSON.parse(data);
    console.log(animation_All17 + ":" + data.length);
    var newData = [];
    for(var i = 0, len = data.length; i < len; ++i){
        if(new Date(data[i].action.ts).getMonth() > 7){
            continue;
            console.log(data[i]);
        }
        if(data[i].action.type === "error"){
        	continue;
        	console.log(data[i]);
        }
        delete data[i]._id;
        delete data[i].username;
        delete data[i].action.duration;
        delete data[i].action.prevTime;
        delete data[i].action.paused;
        newData.push({
            videoId:data[i].videoId,
            currentTime:data[i].action.currentTime,
            ts:data[i].action.ts,
            type:data[i].action.type
        });
        
    }
    fs.writeFile(dataPath + animation_All17 + "_clean",JSON.stringify(newData),function(err) {
        console.log(err);
    });
    
    let clickDataGroupByVideo = {},click;
    for(var i = 0, len = newData.length; i<len; ++i){
        click = newData[i];
        if(!clickDataGroupByVideo[click.videoId]) clickDataGroupByVideo[click.videoId] = {};
        if(!clickDataGroupByVideo[click.videoId][click.type]) clickDataGroupByVideo[click.videoId][click.type] = {};
        if(!clickDataGroupByVideo[click.videoId][click.type][click.currentTime])clickDataGroupByVideo[click.videoId][click.type][click.currentTime] = 0;
        ++clickDataGroupByVideo[click.videoId][click.type][click.currentTime];
    }
    
    let videoIds = Object.keys(clickDataGroupByVideo);
    var video;
    for(var i = 0, len = videoIds.length; i < len; ++i){
        video = clickDataGroupByVideo[videoIds[i]];
        var types = Object.keys(video);
        for(var j = 0,lenj = types.length; j < lenj; ++j){
            click = [];
            var clickTimes = Object.keys(video[types[j]]);
            var maxTime = -Infinity;
            for(var k = 0, lenk = clickTimes.length; k < lenk; ++k){
                if(+clickTimes[k] > maxTime) maxTime = +clickTimes[k];
            }
            for(var k = 0; k <= maxTime;++k){
                click[k] = {x:k,y:video[types[j]][k] ? video[types[j]][k]: 0};
            }
            if(!video.maxTime)video.maxTime = 0;
            if(maxTime+1 > video.maxTime) video.maxTime = maxTime+1;
            if(!video.layers) video.layers = [];
            
            video.layers.push({name:types[j],values:click});
            delete video[types[j]];
        }
    }
    
    for(var i = 0,len = videoIds.length; i < len; ++i){
        video = clickDataGroupByVideo[videoIds[i]];
        var maxTime = +video.maxTime;
        video.layers.forEach(function(d){
            if(d.values.length < maxTime){
                for(var j = d.values.length; j < maxTime; ++j){
                    d.values.push({x:j,y:0});
                }
            }
        });
    }
    
    for(var i = 0, len = videoIds.length; i < len; ++i){
        video = clickDataGroupByVideo[videoIds[i]];
        var maxValue = -Infinity;
        var secondMaxValue = -Infinity;
        for(var j = 0, lenj = video.layers[0].values.length;j < lenj; ++j){
            var tempValue = 0;
            video.layers.forEach(function(d){
                tempValue += d.values[j].y;
            })
            if(tempValue > maxValue){
                secondMaxValue = maxValue;
                maxValue = tempValue;
            } else if(tempValue > secondMaxValue){
                secondMaxValue = tempValue;
            }
            
        }
        video.maxSumValues = maxValue;
        video.secondMaxSumValues = secondMaxValue;
    }
    
    
    fs.writeFile(dataPath + animation_All17+"_clean_stack",JSON.stringify(clickDataGroupByVideo),function(err){
        console.log(err);
    });
    
});


// fs.readFile(dataPath + typeCount_noDiff, 'utf8', function (err, data) {
//     if (err) throw err;
//     data = JSON.parse(data);
//     console.log(typeCount_noDiff + ":" + data.length);

//     console.log(data[0]);
// });
