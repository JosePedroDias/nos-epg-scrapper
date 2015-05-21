var fs = require('fs');
var async = require('async');



var DIR_CACHE = 'cache';
var DIR_CHANNELS = 'cache/channels';
var DIR_PROGRAMS = 'cache/programs';
var FILE_CHANNELS = 'cache/channels.json';
var SL = '/';
var DOT_JSON = '.json';


var readJSON = function(fileName, cb) {
    fs.readFile(fileName, function(err, data) {
        if (err) { return cb(err); }
        cb(null, JSON.parse(data.toString()));
    });
};

var writeAsJSON = function(fileName, o, cb) {
    //fs.writeFile(fileName, JSON.stringify(o, null, '\t'), cb);
    fs.writeFile(fileName, JSON.stringify(o), cb);
};

var ignoreError = function(cb) {
    return function() {
        return cb(null);
    };
};

var negateArg0 = function(cb) {
    return function(arg0) {
        return cb(!arg0);
    };
};



//

var init = function(cb) {
    // create dirs, ignoring errors
    async.each(
        [DIR_CACHE, DIR_CHANNELS, DIR_PROGRAMS],
        function(dirName) { fs.mkdir(dirName, ignoreError(cb)) },
        cb
    );
};



//

var getChannels = function(cb) {
    readJSON(FILE_CHANNELS, cb);
};

var putChannels = function(arr, cb) {
    writeAsJSON(FILE_CHANNELS, arr, function(err) {
        if (err) { return cb(err); }

        async.eachLimit(
            arr,
            4,
            function(ch, cb2) {
                fs.mkdir([DIR_CHANNELS, ch.number].join(SL), ignoreError(cb));
            },
            cb
        );
    });
};



//

var checkChannelDayProgs = function(channelId, dayString, cb) {
    fs.exists([DIR_CHANNELS, channelId, dayString+DOT_JSON].join(SL), cb);
};

var getChannelDayProgs = function(channelId, dayString, cb) {
    readJSON([DIR_CHANNELS, channelId, dayString+DOT_JSON].join(SL), cb);
};

var putChannelDayProgs = function(channelId, dayString, cdp, cb) {
    writeAsJSON([DIR_CHANNELS, channelId, dayString+DOT_JSON].join(SL), cb);
};



//

var checkProgram = function(channelId, programId, cb) {
    fs.exists([DIR_PROGRAMS, channelId, programId+DOT_JSON].join(SL), cb);
};

var getProgram = function(channelId, programId, cb) {
    readJSON([DIR_PROGRAMS, channelId, programId+DOT_JSON].join(SL), cb);
};

var putProgram = function(channelId, programId, p, cb) {
    writeAsJSON([DIR_PROGRAMS, channelId, programId+DOT_JSON].join(SL), cb);
};



//

module.exports = {
    init: init,
    getChannels: getChannels,
    putChannels: putChannels,
    checkChannelDayProgs: checkChannelDayProgs,
    getChannelDayProgs: getChannelDayProgs,
    putChannelDayProgs: putChannelDayProgs,
    checkProgram: checkProgram,
    getProgram: getProgram,
    putProgram: putProgram
};
