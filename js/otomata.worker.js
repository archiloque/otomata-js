importScripts("otomata.constants.js");

var stones = [];
var lastGrid = null;
var timer = null;

// if the tick is running
var ticking = false;
var waitingClicks = null;

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
            }, 250);
        }
    } else if (messageType == 'stop') {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    } else if (messageType == 'clear') {
        var stonesToRepaint = [];
        for (var i = 0; i < Otomata.numberOfCells; i++) {
            for (var j = 0; j < Otomata.numberOfCells; j++) {
                if (lastGrid[i][j] && (lastGrid[i][j].length > 0)) {
                    stonesToRepaint.push([i, j , 5, 0]);
                    lastGrid[i][j] = null;
                }
            }
        }
        repaint(stonesToRepaint);
        stones = [];
    }

}, false);

function repaint(stones) {
    self.postMessage(['updateStones', stones]);
}

function playSounds(sounds) {
    self.postMessage(['playSounds', sounds]);
}

/**
 * Called at each tick.
 */
function tick() {
    ticking = true;
    var stonesToPaint = [];
    var soundsToPlay = [];

    // calculate the new grid
    var newGrid = new Array(Otomata.numberOfCells);
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        newGrid[i] = new Array(Otomata.numberOfCells);
    }

    for (i = 0; i < stones.length; i++) {
        var stone = stones[i];
        if (stone) {
            if (stone[2] == 0) {
                // go up
                if (stone[1] == 0) {
                    // hit the ceiling
                    soundsToPlay.push(stone[0]);
                    stone[2] = 2;
                    stone[3] = 1;
                    stonesToPaint.push([i, null, null, stone[2]]);
                } else {
                    stone[1]--;
                    stone[3] = 0;
                    stonesToPaint.push([i, null, stone[1], null]);
                }
                } else if (stone[2] == 1) {
                // go right
                if (stone[0] == (Otomata.numberOfCells - 1)) {
                    // hit the right wall
                    soundsToPlay.push(stone[1]);
                    stone[2] = 3;
                    stone[3] = 1;
                    stonesToPaint.push([i, null, null, stone[2]]);
                } else {
                    stone[0]++;
                    stone[3] = 0;
                    stonesToPaint.push([i, stone[0], null, null]);
                }
            } else if (stone[2] == 2) {
                // go down
                if (stone[1] == (Otomata.numberOfCells - 1)) {
                    // hit the floor
                    soundsToPlay.push(stone[0]);
                    stone[2] = 0;
                    stone[3] = 1;
                    stonesToPaint.push([i, null, null, stone[2]]);
                } else {
                    stone[1]++;
                    stone[3] = 0;
                    stonesToPaint.push([i, null, stone[1], null]);
                }
            } else {
                // go left
                if (stone[0] == 0) {
                    // hit the left wall
                    soundsToPlay.push(stone[1]);
                    stone[2] = 1;
                    stone[3] = 1;
                    stonesToPaint.push([i, null, null, stone[2]]);
                } else {
                    stone[0]--;
                    stone[3] = 0;
                    stonesToPaint.push([i, stone[0], null, null]);
                }
            }

            var items = newGrid[stone[0]][stone[1]];
            if (items) {
                items.push(stone);
            } else {
                newGrid[stone[0]][stone[1]] = [stone];
            }

        }
    }

    // now switch the direction of collisions and
    // repaint what is needed

    for (i = 0; i < Otomata.numberOfCells; i++) {
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            var onNewGrid = newGrid[i][j];
            if (onNewGrid  && (onNewGrid.length >= 2)) {
                // update their direction
                var hit = false;
                for (var k = 0; k < onNewGrid.length; k++) {
                    onNewGrid[k][2] = (onNewGrid[k][2] + 1) % 4;
                    hit = hit || onNewGrid[k][3];
                    stonesToPaint.push([onNewGrid[k][4], null, null, onNewGrid[k][2]]);
                }
            }
        }
    }

    if (stonesToPaint.length > 0) {
        repaint(stonesToPaint);
    }
    if(soundsToPlay.length > 0) {
        playSounds(soundsToPlay);
    }

    lastGrid = newGrid;
    ticking = false;

    // if there is waiting actions, play them now
    if (waitingClicks) {
        for (i = 0; i < waitingClicks.length; i++) {
            clickStone(waitingClicks[i][0], waitingClicks[i][1]);
        }
        self.postMessage(['log', waitingClicks.length]);
        waitingClicks = null;
    }
}

/**
 * We clicked on a stone.
 * @param x the stone column index
 * @param y the stone row index.
 */
function clickStone(x, y) {
    // if the tick is running, store the action to play it later
    if (ticking) {
        if (waitingClicks) {
            waitingClicks.push([x, y]);
        } else {
            waitingClicks = [
                [x, y]
            ];
        }
        return;
    }

    var stonesOnPosition = lastGrid[x][y];
    if ((!stonesOnPosition) || (stonesOnPosition.length == 0)) {
        /// there was no stone => create it
        var newStone = [x, y, 0, 0, stones.length];
        lastGrid[x][y] = [newStone];
        self.postMessage(['addStone', [x, y, stones.length]]);
        stones.push(newStone);
    } else if (stonesOnPosition.length == 1) {
        /// there is one stone => turn it around
        var stone = stonesOnPosition[0];
        stone[2] = (stone[2] + 1) % 5;
        if (stone[2] == 4) {
            // we kill the stone
            // then remove it from the list
            lastGrid[x][y] = null;
            stones[stone[4]] = null;
            self.postMessage(['removeStone', stone[4]]);
        } else {
            self.postMessage(['updateStones', [
                [stone[4], null, null, stone[2]]
            ]]);
        }
    } else {
        // more than one stone => do nothing
    }
}

/**
 * Initialize.
 */
function init() {
    lastGrid = new Array(Otomata.numberOfCells);
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        lastGrid[i] = new Array(Otomata.numberOfCells);
    }

}