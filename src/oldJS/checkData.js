'use strict'
var fs = require('fs');

var dataPath = "./data/";
var animation_All17 = "animation_All17.json";
var typeCount_noDiff = "typeCount_noDiff.json";

fs.readFile(dataPath + animation_All17, 'utf8', function (err, data) {
    if (err) throw err;
    data = JSON.parse(data);
    console.log(animation_All17 + ":" + data.length);
    var newData = [];
    for(var i = 0, len = data.length; i < len; ++i){
        if(new Date(data[i].action.ts).getMonth() > 8){
            continue;
            console.log(data[i]);
        }else{
            console.log(new Date(data[i].action.ts).getMonth());
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
});


// fs.readFile(dataPath + typeCount_noDiff, 'utf8', function (err, data) {
//     if (err) throw err;
//     data = JSON.parse(data);
//     console.log(typeCount_noDiff + ":" + data.length);

//     console.log(data[0]);
// });
