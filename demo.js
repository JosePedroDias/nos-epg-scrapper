var fs = require('fs');

var async = require('async');
var request = require('request');

var s = require('./index');



var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };

var writeAsJSON = function(fileName, o, cb) {
    fs.writeFile(fileName, JSON.stringify(o, null, '  '), cb);
    //fs.writeFile(fileName, JSON.stringify(o), cb);
};

var saveAsJSON = function(fileName) {
    return function(err, o) {
        if (err) { return console.error(err); }

        writeAsJSON(fileName, o, log2);
    }
};



//s.getChannels(log2);
//s.getChannels(saveAsJSON('cache/channels.json'));



//s.getChannel('232', log2); // +tvi
//s.getChannel('232', saveAsJSON('232.json'));



var channels = JSON.parse( fs.readFileSync('cache/channels.json').toString() );
//var channels = [{number:'5', name:'RTP 1'}];
//channels.forEach(function(ch) {
async.map(channels, function(ch, outerCb) {
    console.log('* ' + ch.name);
    var num = ch.number;
    var dirName = 'cache/' + num;
    fs.mkdir(dirName, function(err) {
        //if (err) { return console.error(err); }

        s.getChannel(num, function(err, data) {
            if (err) { return console.error(err); }

            ch.acronym = data.acronym;
            ch.logo = 'http:' + data.logo;

            writeAsJSON(dirName + '/info.json', ch, function(err) {
                if (err) { return console.error(err); }

                request
                    .get(ch.logo)
                    .on('error', function(err) { console.log(err) })
                    .pipe( fs.createWriteStream(dirName + '/logo.png') );

                    var items = Object.keys(data.progs).map(function(date) {
                        return {
                            fileName: dirName + '/' + date + '.json',
                            obj:      data.progs[date]
                        };
                    });

                    var work = function(o, cb) {
                        console.log('**' + o.fileName);
                        writeAsJSON(o.fileName, o.obj, cb);
                    };

                    async.map(items, work, outerCb);
            });
        });
    });
    //
}, log2);



/*
var acronym232 = "MAISTVISD";

var p51288 = {
    "id": "51288",
    "genre": "entretenimento",
    "title": "The Block All Stars",
    "startT": "00:00",
    "endT": "00:30"
};
*/
//s.getProgram(acronym232, p51288, saveAsJSON('p51288.json'));
