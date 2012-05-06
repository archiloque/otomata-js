importScripts("otomata.constants.js");

var stoneStatuses = new Array(Otomata.numberOfCells);
var timer = null;

self.addEventListener('message', function (e) {
    var messageType = e.data[0];
    if (messageType == 'click') {
        clickStone(e.data[1][0], e.data[1][1]);
    } else if (messageType == 'init') {
        init();
    } else if (messageType == 'start') {
        if (!timer) {
            timer = setInterval(function () {
                tick();
            }, 500);
        }
    } else if (messageType == 'stop') {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

}, false);

/**
 * Called at each tick.
 */
function tick() {

}

/**
 * We clicked on a stone.
 * @param x the stone column index
 * @param y the stone row index.
 */
function clickStone(x, y) {
    var originalStatus = stoneStatuses[x][y];
    var newStatus = (originalStatus + 1) % 5;
    stoneStatuses[x][y] = newStatus;
    self.postMessage(['paint', [x, y, newStatus]]);
}

/**
 * Initialize.
 * at this moment stoneStatuses is set.
 */
function init() {
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        stoneStatuses[i] = new Array(Otomata.numberOfCells);
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            stoneStatuses[i][j] = 0;
        }
    }
}