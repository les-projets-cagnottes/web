// Amount of Snowflakes
var snowMax = -1;

// Snowflake Colours
var snowColor = ["#DDD", "#EEE"];

// Snow Entity
var snowEntity = "&#x2022;";

// Falling Velocity
var snowSpeed = 0.75;

// Minimum Flake Size
var snowMinSize = 8;

// Maximum Flake Size
var snowMaxSize = 24;

// Refresh Rate (in milliseconds)
var snowRefresh = 50;

// Start Interval (in milliseconds)
var startInterval = 120000;

// Stop Interval (in milliseconds)
var stopInterval = 60000;

// Additional Styles
var snowStyles = "cursor: default; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none;";

/*!
// Snow.js - v0.0.3
// kurisubrooks.com
*/
var snow = [],
    pos = [],
    coords = [],
    lefr = [],
    marginBottom, marginRight;

function start() {
    snowMax = 35;
    initSnow();
    setTimeout("stop()", stopInterval);
}

function stop() {
    var body = document.getElementsByTagName('body')[0];
    for (i = 0; i <= snowMax; i++) {
        body.removeChild(document.getElementById('flake' + i));
    }

    snow = [];
    pos = [];
    coords = [];
    lefr = [];
    marginBottom, marginRight;

    snowMax = -1;
    setTimeout("start()", startInterval);
}

function randomise(range) { rand = Math.floor(range * Math.random()); return rand; }

function initSnow() {
    var body = document.getElementsByTagName('body')[0];
    var span;
    for (i = 0; i <= snowMax; i++) {
        span = document.createElement("span");
        span.setAttribute("id", 'flake' + i);
        span.setAttribute("style", snowStyles + "position:absolute;top:-" + snowMaxSize);
        span.innerHTML = snowEntity;
        body.appendChild(span);
    }

    var snowSize = snowMaxSize - snowMinSize;
    marginBottom = document.body.scrollHeight - 5;
    marginRight = document.body.clientWidth - 15;
    for (i = 0; i <= snowMax; i++) {
        coords[i] = 0;
        lefr[i] = Math.random() * 15;
        pos[i] = 0.03 + Math.random() / 10;
        snow[i] = document.getElementById("flake" + i);
        snow[i].style.fontFamily = "inherit";
        snow[i].size = randomise(snowSize) + snowMinSize;
        snow[i].style.fontSize = snow[i].size + "px";
        snow[i].style.color = snowColor[randomise(snowColor.length)];
        snow[i].style.zIndex = 1000;
        snow[i].sink = snowSpeed * snow[i].size / 5;
        snow[i].posX = randomise(marginRight - snow[i].size);
        snow[i].posY = randomise(2 * marginBottom - marginBottom - 2 * snow[i].size);
        snow[i].style.left = snow[i].posX + "px";
        snow[i].style.top = snow[i].posY + "px";
    }
    moveSnow();
}

function resize() {
    marginBottom = document.body.scrollHeight - 5;
    marginRight = document.body.clientWidth - 15;
}

function moveSnow() {
    for (i = 0; i <= snowMax; i++) {
        coords[i] += pos[i];
        snow[i].posY += snow[i].sink;
        snow[i].style.left = snow[i].posX + lefr[i] * Math.sin(coords[i]) + "px";
        snow[i].style.top = snow[i].posY + "px";
        if (snow[i].posY >= marginBottom - 2 * snow[i].size || parseInt(snow[i].style.left) > (marginRight - 3 * lefr[i])) {
            snow[i].posX = randomise(marginRight - snow[i].size);
            snow[i].posY = 0;
        }
    }
    setTimeout("moveSnow()", snowRefresh);
}

if(Math.random() > 0.8) {
    window.onresize = resize;
    window.onload = stop;
}