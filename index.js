var scrap = require('scrap');
var request = require('request');
var moment = require('moment');



var PROTOCOL_HTTP = 'http:';
var PREFIX_EPG = 'http://www.nos.pt/particulares/televisao/guia-tv/Pages/channel.aspx';
var PREFIX_PROGRAMS = 'http://www.nos.pt/_layouts/Armstrong/ApplicationPages/EPGGetProgramsAndDetails.aspx/GetProgramDetails';
var PREFIX_IMAGES = 'http://images.nos.pt/';


function getChannels(cb) {
    scrap(PREFIX_EPG, function (err, $) {
        if (err) { return cb(err); }

        cb(null, $('.dropdown-ord li a').map(function(i, el) {
            var t = $(this).text().trim();
            var a = t.indexOf('  ');
            var b = t.lastIndexOf(' ');
            return {
                name: t.substring(0, a-2),
                number: t.substring(b+1)
            };
        }));
    });
}



function getChannel(chNr, cb) {
    scrap(PREFIX_EPG + '?channel=' + chNr, function (err, $) {
        if (err) { return cb(err); }

        var img = $('#channel-logo img');
        var name = $('#channel-name').text().trim();
        var logo = PROTOCOL_HTTP + img.attr('src');
        var acronym = img.attr('alt');
        var days = {};

        $('.programs-day-list').each(function(i, pdl) {
            //var id = $(pdl).attr('id');
            //id = id.substring(3);
            var id = moment().add(i, 'days').format('YYYY-MM-DD');

            var progs = $(this).find('li a').map(function(i, l) {
                var t = $(l).text();
                var m = (/(\d\d\:\d\d)/m).exec(t);
                return {
                    id: $(l).attr('id'),
                    genre: $(l).attr('class'),
                    title: $(l).attr('title'),
                    startT: m[1],
                    endT: t.substr(t.length - 6, 5)
                };
            });

            days[id] = progs;
        });

        cb(null, {name:name, logo:logo, acronym:acronym, progs:days});
    });
}



function getProgramLowLevel(pO, cb) {
    request(
        {
            uri: PREFIX_PROGRAMS,
            method: 'POST',
            json: true,
            body: pO,
        },
        function (err, resp, body) {
            if (!err && resp.statusCode === 200) {
                var d = body.d.split('_#|$_');
                return cb(null, {
                    title: d[0],
                    desc: d[1],
                    shot: PREFIX_IMAGES + d[2],
                    startT: d[3],
                    endT: d[4],
                    channel: d[5],
                    startD: d[6],
                    endD: d[7]/*,
                    dunno: d[8]*/
                });
            }
            cb(err);
    })
}

function getProgram(chAcronym, progO, cb) {
    getProgramLowLevel({
        programId: progO.id,
        channelAcronym: chAcronym,
        hour: '0',
        startHour: progO.startT,
        endHour: progO.endT
    }, cb);
}



module.exports = {
    getChannels: getChannels,
    getChannel: getChannel,
    getProgram: getProgram
};
