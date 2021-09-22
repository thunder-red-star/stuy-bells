$(function () {
    var socket = io();

    socket.on('time', updateInfo);

    function updateInfo(info) {
        t = info.time;
        p = info.period.pd;
        b = info.period;
        btill = b.till
        if (btill == 0) {
            btill = "<1"
        }
        document.getElementById('time').innerHTML = t;
        document.getElementById('schedule').innerHTML = info.schedule;
        document.getElementById('period').innerHTML = p;
        document.getElementById('before').innerHTML = b.since;
        document.getElementById('after').innerHTML = btill;
        document.getElementById('viewers').innerHTML = info.viewers;
        document.getElementById("pb").style.width = (b.secsSince / b.max) * 100 + "%"
        if (b.till <= 5) {
            document.getElementById("pbcont").classList.add("red")
            document.getElementById("pbcont").classList.remove("green")
        }
        else {
            document.getElementById("pbcont").classList.remove("red")
            document.getElementById("pbcont").classList.add("green")
        }
        if (Math.round(b.secsTill) % 2 == 0 && b.till <= 5) {
            document.getElementById("after").style.color = "#FF9F9F"
        }
        else {
            document.getElementById("after").style.color = "#FF0000"
        }
        console.log(b.till)
    }
});
