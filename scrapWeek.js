var fs = require('fs');

var async = require('async');
var judas = require('judas');

var s = require('./index');



var STEP = 3;



var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };

var logOk = function(err, o) { if (err) { return console.error(err); } console.log('OK!'); };

var writeAsJSON = function(fileName, o, cb) {
    //fs.writeFile(fileName, JSON.stringify(o, null, '\t'), cb);
    fs.writeFile(fileName, JSON.stringify(o), cb);
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

var mergeArrayOfArrays = function(arr) {
    var merged = [];
    return merged.concat.apply(merged, arr);
};



// STEP 0
if (STEP === 0) {
    fs.mkdir('cache', function (err) {
        fs.mkdir('cache/channels', function (err) {
            fs.mkdir('cache/programs', function (err) {
                s.getChannels(saveAsJSON('cache/channels.json'));
            });
        });
    });
}



// UPDATE CHANNEL DAYS
if (STEP === 1) {
    var channels = JSON.parse(fs.readFileSync('cache/channels.json').toString());

    async.eachLimit(channels, 1, function (ch, outerCb) {
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

                judas(ch.logo, dirName + '/logo.', function(err, localPath) {
                    if (err) {
                        //return outerCb(err);
                        console.log('Could not determine mime type for ' + ch.logo + ' -> skipping...');
                    }
                    else {
                        ch.logoLocal = 'logo.' + localPath.split('.').pop();
                    }

                    writeAsJSON(dirName + '/info.json', ch, function(err) {
                        if (err) {
                            return outerCb(err);
                        }

                        var items = Object.keys(data.progs).map(function (date) {
                            return {
                                fileName: dirName + '/' + date + '.json',
                                obj: data.progs[date]
                            };
                        });

                        var work = function (o, cb) {
                            console.log('** ' + o.fileName);
                            writeAsJSON(o.fileName, o.obj, cb);
                        };

                        async.each(items, work, outerCb);
                    });
                });
            });
        });
    }, logOk);
}



// FETCH PROGRAM DETAILS
if (STEP === 2) {
    var channels = JSON.parse(fs.readFileSync('cache/channels.json').toString());

    async.eachLimit(channels, 1, function (ch, outerCb) {
        console.log('* ' + ch.name);
        var num = ch.number;
        var dirName = 'cache/programs/' + num;
        var dirName2 = 'cache/channels/' + num;
        fs.mkdir(dirName, function () {
            loadAsJSON(dirName2 + '/info.json', function (err, ch2) {
                if (err) {
                    return outerCb(err);
                }

                fs.readdir(dirName2, function (err, daysProgFileNames) {
                    if (err) {
                        return outerCb(err);
                    }

                    async.mapLimit(
                        daysProgFileNames,
                        1,
                        function (fn, cb2) {
                            if (fn === 'info.json' || fn === 'logo.png' || fn === 'logo.jpg') {
                                return cb2(null);
                            }

                            var dayFn = dirName2 + '/' + fn;

                            console.log('** ' + dayFn);
                            loadAsJSON(dayFn, cb2);
                        },
                        function (err, daysProgs) {
                            if (err) {
                                return outerCb(err);
                            }

                            daysProgs = daysProgs.filter(function (v) {
                                return !!v;
                            });

                            var progs = mergeArrayOfArrays(daysProgs);

                            async.eachLimit(
                                progs,
                                2,
                                function (prog, cb3) {
                                    var progFileName = dirName + '/' + prog.id + '.json';
                                    fs.stat(progFileName, function (err, stat) {
                                        if (!err && stat.isFile()) {
                                            console.log('*** ' + progFileName + ' SKIPPED');
                                            return cb3(null);
                                        }

                                        console.log('*** ' + progFileName + ' FETCHING...');
                                        s.getProgram(ch2.acronym, prog, function (err, progData) {
                                            if (err) {
                                                return cb3(err);
                                            }

                                            //console.log('*** ' + progFileName + ' SAVING...');
                                            writeAsJSON(progFileName, progData, cb3);
                                        });
                                    });
                                },
                                outerCb
                            );
                        }
                    );
                });
            });
        })
    }, logOk);
}




// DETERMINE CHANNEL GENRES
if (STEP === 3) {
    var channels = JSON.parse(fs.readFileSync('cache/channels.json').toString());

    async.eachLimit(channels, 1, function (ch, outerCb) {
        console.log('* ' + ch.name);
        var num = ch.number;
        var dirName = 'cache/channels/' + num;

        fs.readdir(dirName, function (err, daysProgFileNames) {
            if (err) {
                return outerCb(err);
            }

            async.mapLimit(
                daysProgFileNames,
                1,
                function (fn, cb2) {
                    if (fn === 'info.json' || fn === 'logo.png' || fn === 'logo.jpg') {
                        return cb2(null);
                    }

                    var dayFn = dirName + '/' + fn;

                    //console.log('** ' + dayFn);
                    loadAsJSON(dayFn, cb2);
                },
                function (err, daysProgs) {
                    if (err) {
                        return outerCb(err);
                    }

                    daysProgs = daysProgs.filter(function (v) {
                        return !!v;
                    });

                    var progs = mergeArrayOfArrays(daysProgs);

                    var histo = s.determineChannelGenre(progs);
                    var h0 = histo[0];
                    console.log(JSON.stringify(histo));
                    //console.log('                                 ', h0.percentage > 0.66 ? h0.genre : 'generico ('+h0.genre+' '+(100*h0.percentage).toFixed(1)+'%)');

                    outerCb(null);
                }
            );
        });
    }, logOk);
}
