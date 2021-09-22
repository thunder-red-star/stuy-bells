var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const dateParser = require('node-date-parser');
const stuySchedule = require('./data/stuy.json')

let sched = "Regular"

process.env.TZ = "America/New_York"
// TODO: extract below

// ----------------------------------------
// Main server code
// ----------------------------------------

totalViewers = 0;

// serve css and js
app.use(express.static('public'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

function parseToTimestamp(thetime) {
    let timeArray = thetime.split(":")
    let l = (parseInt(timeArray[0]) * 3600) + (parseInt(timeArray[1]) * 60) + parseInt(timeArray[2])
    return l
}

function parseToMinutes(thetime) {
    return Math.floor(thetime / 60)
}

function getClass (timestamp, schedule) {
    stuyPeriods = stuySchedule[sched]
    period = ""
    Object.keys(stuyPeriods).forEach((key) => {
        if (parseToTimestamp(stuyPeriods[key]["start"]) <= timestamp && parseToTimestamp(stuyPeriods[key]["end"]) >= timestamp) {
            period = key
        }
    })
    ans = {}
    ans.pd = period
    ans.since = parseToMinutes(timestamp - parseToTimestamp(stuyPeriods[period]["start"]))
    ans.secsSince = timestamp - parseToTimestamp(stuyPeriods[period]["start"])
    ans.till = parseToMinutes(parseToTimestamp(stuyPeriods[period]["end"]) - timestamp)
    ans.secsTill = parseToTimestamp(stuyPeriods[period]["end"]) - timestamp
    ans.max = parseToTimestamp(stuyPeriods[period]["end"]) - parseToTimestamp(stuyPeriods[period]["start"])
    return ans
}

function emitUpdates() {
    currentTime = dateParser.parse('H:i:s');
    currentTimestamp = parseToTimestamp(currentTime)
    period = getClass(currentTimestamp, sched)
    hr = currentTime.split("").slice(0, 2).join("")
    hour = parseInt(hr)
    if (hour > 12) {
        hour = hour - 12
        currentTime = hour + currentTime.split("").slice(2).join("") + " PM"
    }
    else {
        currentTime = hour + currentTime.split("").slice(2).join("") + " AM"
    }
    io.emit('time', { schedule: sched, period: period, time: currentTime, timestamp: currentTimestamp, viewers: totalViewers});
}

updateInterval = setInterval(emitUpdates, 1000)

io.on('connection', function(socket) {
    totalViewers += 1
    console.log("Connection established!")
    socket.on('disconnect', function() {
        totalViewers -= 1
        console.log("Someone left :(")
    });
});

http.listen(process.env.PORT || 3000, function() {
    console.log('listening on *:3000', process.env.PORT);
});
