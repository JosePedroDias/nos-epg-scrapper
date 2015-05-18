var fs = require('fs');

var s = require('./index');



var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };

var saveAsJSON = function(fileName) {
    return function(err, o) {
        if (err) { return console.error(err); }

        fs.writeFile(fileName, JSON.stringify(o, null, '  '), log2);
    }
};



//s.getChannels(log2);
//s.getChannels(saveAsJSON('channels.json'));



//s.getChannel('232', log2); // +tvi
//s.getChannel('232', saveAsJSON('232.json'));



var acronym232 = "MAISTVISD";

var p51288 = {
    "id": "51288",
    "genre": "entretenimento",
    "title": "The Block All Stars",
    "startT": "00:00",
    "endT": "00:30"
};

s.getProgram(acronym232, p51288, saveAsJSON('p51288.json'));
