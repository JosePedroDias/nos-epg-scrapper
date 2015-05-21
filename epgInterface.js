var init = function(cb) {

};

//

var getChannels = function(cb) {

};

var putChannels = function(arr, cb) {

};

//

var checkChannelDayProgs = function(channelId, dayString, cb) {

};

var getChannelDayProgs = function(channelId, dayString, cb) {

};

var putChannelDayProgs = function(channelId, dayString, cdp, cb) {

};

//

var checkProgram = function(channelId, programId, cb) {

};

var getProgram = function(channelId, programId, cb) {

};

var putProgram = function(channelId, programId, p, cb) {

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
