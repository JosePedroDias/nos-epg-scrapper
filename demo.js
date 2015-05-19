var fs = require('fs');

var async = require('async');
var request = require('request');

var s = require('./index');



var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };

var logOk = function(err, o) { if (err) { return console.error(err); } console.log('OK!'); };

var writeAsJSON = function(fileName, o, cb) {
    fs.writeFile(fileName, JSON.stringify(o, null, '  '), cb);
    //fs.writeFile(fileName, JSON.stringify(o), cb);
};

var loadAsJSON = function(fileName, cb) {
    fs.readFile(fileName, function(err, data) {
        if (err) { return cb(err); }

        try {
            cb(null, JSON.parse(data.toString()));
        } catch (ex) {
            cb(ex);
        }
    });
};

var saveAsJSON = function(fileName) {
    return function(err, o) {
        if (err) { return console.error(err); }

        writeAsJSON(fileName, o, log2);
    }
};



// STEP 0
if (false) {
    fs.mkdir('cache', function (err) {
        fs.mkdir('cache/channels', function (err) {
            fs.mkdir('cache/programs', function (err) {
                s.getChannels(saveAsJSON('cache/channels.json'));
            });
        });
    });
}



// UPDATE CHANNEL DAYS
if (false) {
    //var channels = [];
    //var channels = [{number:'5', name:'RTP 1'}];
    var channels = JSON.parse(fs.readFileSync('cache/channels.json').toString());

    async.map(channels, function (ch, outerCb) {
        console.log('* ' + ch.name);
        var num = ch.number;
        var dirName = 'cache/channels/' + num;
        fs.mkdir(dirName, function () {
            s.getChannel(num, function (err, data) {
                if (err) {
                    return outerCb(err);
                }

                ch.acronym = data.acronym;
                ch.logo = data.logo;

                writeAsJSON(dirName + '/info.json', ch, function (err) {
                    if (err) {
                        return outerCb(err);
                    }

                    request
                        .get(ch.logo)
                        .on('error', function (err) {
                            outerCb(err);
                        })
                        .pipe(fs.createWriteStream(dirName + '/logo.png'));

                    var items = Object.keys(data.progs).map(function (date) {
                        return {
                            fileName: dirName + '/' + date + '.json',
                            obj: data.progs[date]
                        };
                    });

                    var work = function (o, cb) {
                        console.log('**' + o.fileName);
                        writeAsJSON(o.fileName, o.obj, cb);
                    };

                    async.map(items, work, outerCb);
                });
            });
        });
    }, logOk);
}



// FETCH PROGRAM DETAILS
if (false) {
    //var channels = [];
    //var channels = [{number:'5', name:'RTP 1'}];
    var channels = JSON.parse(fs.readFileSync('cache/channels.json').toString());

    async.map(channels, function (ch, outerCb) {
        console.log('* ' + ch.name);
        var num = ch.number;
        var dirName = 'cache/programs/' + num;
        fs.mkdir(dirName, function () {
            loadAsJSON('cache/channels/' + num + '/info.json', function (err, ch2) {
                if (err) {
                    return outerCb(err);
                }

                // TODO FOR EACH DAY IN CHANNEL

                // CHECK IF DIR IN PROGRAMS EXISTS

                // EXISTS, SKIP
                // DOESN'T; ADD TO WORKLOAD

                /*var items = Object.keys(data.progs).map(function (date) {
                    return {
                        fileName: dirName + '/' + date + '.json',
                        obj: data.progs[date]
                    };
                });

                var work = function (o, cb) {
                    console.log('**' + o.fileName);
                    writeAsJSON(o.fileName, o.obj, cb);
                };

                async.map(items, work, outerCb);*/
            });
        })
    }, logOk);



// FETCH PROGRAM DETAILS

if (false) {
    var acronym7 = "SIC";

    var p82906 = {
        "id": "82906",
        "genre": "entretenimento",
        "title": "Mar Salgado T.1 Ep.212",
        "startT": "21:30",
        "endT": "22:30"
    };
    //s.getProgram(acronym7, p82906, saveAsJSON('cache/programs/82906.json'));

    var p82924 = {
        "id": "82924",
        "genre": "entretenimento",
        "title": "Mar Salgado T.1 Ep.213",
        "startT": "22:00",
        "endT": "22:30"
    };
    s.getProgram(acronym7, p82924, saveAsJSON('cache/programs/82924.json'));
}
