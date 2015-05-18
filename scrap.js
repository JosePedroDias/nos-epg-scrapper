var fs = require('fs');

var scrap = require('scrap');
var request = require('request');



var prefix = 'http://www.nos.pt/particulares/televisao/guia-tv/Pages/channel.aspx';
var prefix2 = 'http://www.nos.pt/_layouts/Armstrong/ApplicationPages/EPGGetProgramsAndDetails.aspx/GetProgramDetails';



var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };

var saveAsJSON = function(fileName) {
    return function(err, o) {
        if (err) { return console.error(err); }
        fs.writeFile(fileName, JSON.stringify(o, null, '  '), log2);
    }
};



function getChannels(cb) {
    scrap(prefix, function (err, $) {
        if (err) { return cb(err); }

        cb(null, $('.dropdown-ord li a').map(function(i, el) {
            var t = $(this).text().trim();
            var a = t.indexOf('  ');
            var b = t.lastIndexOf(' ');
            return [t.substring(0, a-2), t.substring(b+1)];
        }));
    });
}

function getChannel(chNr, cb) {
    scrap(prefix + '?channel=' + chNr, function (err, $) {
        if (err) { return cb(err); }

        var name = $('#channel-name').text().trim();
        var logo = $('#channel-logo img').attr('src');
        var days = {};

        $('.programs-day-list').each(function(i, pdl) {
            var id = $(pdl).attr('id');
            id = id.substring(3);

            var progs = $(this).find('li a').map(function(i, l) {
                var t = $(l).text();
                var m = (/(\d\d\:\d\d)/m).exec(t);
                return {
                    i: $(l).attr('id'),
                    c: $(l).attr('class'),
                    t: $(l).attr('title'),
                    s: m[1],
                    e: t.substr(t.length - 6, 5)
                };
            });

            days[id] = progs;
        });

        cb(null, {name:name, logo:logo, progs:days});
    });
}

function getProgram(pO, cb) {
    request(
        {
            uri: prefix2,
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
                    shot: d[2],
                    startT: d[3],
                    endT: d[4],
                    channel: d[5],
                    startD: d[6],
                    endD: d[7],
                    dunno: d[8]
                });
            }
            cb(err);
    })
}



//getChannels(log2);
//getChannels(saveAsJSON('channels.json'));



//getChannel('232', log2); // +tvi
//getChannel('232', saveAsJSON('232.json'));



var p51316 = {
    programId: '51316',
    channelAcronym: 'MAISTVISD',
    hour: '0',
    startHour: '23:45',
    endHour: '00:30'
};

//getProgram(p51316, log2);
getProgram(p51316, saveAsJSON('p51316.json'));
