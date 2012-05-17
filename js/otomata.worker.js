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
    self.postMessage(['paint', stones]);
}

function playSound(index, position) {
    self.postMessage(['sound', index, position]);
}

function addItemToGrid(grid, stone) {
    var items = grid[stone[0]][stone[1]];
    if (items) {
        items.push(stone);
    } else {
        grid[stone[0]][stone[1]] = [stone];
    }
}

/**
 * Called at each tick.
 */
function tick() {
    ticking = true;

    // calculate the new grid
    var newGrid = new Array(Otomata.numberOfCells);
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        newGrid[i] = new Array(Otomata.numberOfCells);
    }
    for (i = 0; i < stones.length; i++) {
        var stone = stones[i];
        if (stone[2] == 0) {
            // go up
            if (stone[1] == 0) {
                // hit the ceiling
                playSound(stone[0], 0);
                stone[2] = 2;
                stone[3] = 1;
            } else {
                stone[1]--;
                stone[3] = 0;
            }
        } else if (stone[2] == 1) {
            // go right
            if (stone[0] == (Otomata.numberOfCells - 1)) {
                // hit the right wall
                playSound(stone[1], 1);
                stone[2] = 3;
                stone[3] = 1;
            } else {
                stone[0]++;
                stone[3] = 0;
            }
        } else if (stone[2] == 2) {
            // go down
            if (stone[1] == (Otomata.numberOfCells - 1)) {
                // hit the floor
                playSound(stone[0], 2);
                stone[2] = 0;
                stone[3] = 1;
            } else {
                stone[1]++;
                stone[3] = 0;
            }
        } else {
            // go left
            if (stone[0] == 0) {
                // hit the left wall
                playSound(stone[1], 3);
                stone[2] = 1;
                stone[3] = 1;
            } else {
                stone[0]--;
                stone[3] = 0;
            }
        }
        addItemToGrid(newGrid, stone);
    }

    // now switch the direction of collisions and
    // repaint what is needed
    var stonesToPaint = [];

    for (i = 0; i < Otomata.numberOfCells; i++) {
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            var onLastGrid = lastGrid[i][j];
            var onNewGrid = newGrid[i][j];
            if (!onNewGrid) {
                // no element
                if (onLastGrid && (onLastGrid.length != 0)) {
                    // was not empty
                    if(onLastGrid.length == 1) {
                        stonesToPaint.push([i, j, onLastGrid[0][2], 2]);
                    } else {
                        stonesToPaint.push([i, j, 4, 2]);
                    }
                } else {
                    stonesToPaint.push([i, j, 5, 0]);
                }
            } else if (onNewGrid.length == 1) {
                // 1 element
                if ((!onLastGrid) || (onLastGrid.length != 1)) {
                    stonesToPaint.push(onNewGrid[0]);
                } else if ((onNewGrid[0] == onLastGrid[0]) || (onNewGrid[0][2] != onLastGrid[0][2])) {
                    // element has not the same direction as before
                    // or is the same element (so it must have changed its directions)
                    stonesToPaint.push(onNewGrid[0]);
                }
            } else {
                // more than 1 element

                // update their direction
                var hit = false;
                for (var k = 0; k < onNewGrid.length; k++) {
                    onNewGrid[k][2] = (onNewGrid[k][2] + 1) % 4;
                    hit = hit || onNewGrid[k][3];
                }

                stonesToPaint.push([i, j, 4, hit ? 1 : 0]);
            }
        }
    }

    if(stonesToPaint.length > 0) {
        repaint(stonesToPaint);
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
    var stonesToPaint = [];
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
        var newStone = [x, y, 0, 0];
        lastGrid[x][y] = [newStone];
        stones.push(newStone);
        stonesToPaint.push(newStone);
    } else if (stonesOnPosition.length == 1) {
        /// there is one stone => turn it around
        var stone = stonesOnPosition[0];
        stone[2] = (stone[2] + 1) % 5;
        if (stone[2] == 4) {
            // we kill the stone
            // then remove it from the list
            lastGrid[x][y] = null;
            stone[2] = 5;

            var newStones = [];
            for (var i = 0; i < stones.length; i++) {
                if (stones[i][2] != 5) {
                    newStones.push(stone);
                }
            }
            stones = newStones;
            stonesToPaint.push(stone);
        } else {
            stonesToPaint.push(stone);
        }
    } else {
        // more than one stone => do nothing
    }

    if(stonesToPaint.length > 0) {
        repaint(stonesToPaint);
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