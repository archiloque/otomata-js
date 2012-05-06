importScripts("otomata.constants.js");

var stones = [];
var lastGrid = null;
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
            }, 250);
        }
    } else if (messageType == 'stop') {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    } else if (messageType == 'clear') {
        stones = [];
        for (var i = 0; i < Otomata.numberOfCells; i++) {
            for (var j = 0; j < Otomata.numberOfCells; j++) {
                if (lastGrid[i][j] && (lastGrid[i][j].length > 0)) {
                    repaint([i, j , -1]);
                    lastGrid[i][j] = null;
                }
            }
        }
    }

}, false);

function repaint(stone) {
    self.postMessage(['paint', stone]);
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
                stone[2] = 2;
                stone[1] = 1;
            } else {
                stone[1]--;
            }
        } else if (stone[2] == 1) {
            // go right
            if (stone[0] == (Otomata.numberOfCells - 1)) {
                // hit the right wall
                stone[2] = 3;
                stone[0] = (Otomata.numberOfCells - 2);
            } else {
                stone[0]++;
            }
        } else if (stone[2] == 2) {
            // go down
            if (stone[1] == (Otomata.numberOfCells - 1)) {
                // hit the floor
                stone[2] = 0;
                stone[1] = (Otomata.numberOfCells - 2);
            } else {
                stone[1]++;
            }
        } else {
            // go left
            if (stone[0] == 0) {
                // hit the left wall
                stone[2] = 1;
                stone[0] = 1;
            } else {
                stone[0]--;
            }
        }
        addItemToGrid(newGrid, stone);
    }

    // now switch the direction of collisions and
    // repaint what is needed
    for (i = 0; i < Otomata.numberOfCells; i++) {
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            var onLastGrid = lastGrid[i][j];
            var onNewGrid = newGrid[i][j];
            if (!onNewGrid) {
                // no element
                if (onLastGrid && (onLastGrid.length != 0)) {
                    // was not empty
                    repaint([i, j, -1]);
                }
            } else if (onNewGrid.length == 1) {
                // 1 element
                if ((!onLastGrid) || (onLastGrid.length != 1)) {
                    repaint(onNewGrid[0]);
                } else if ((onNewGrid[0] == onLastGrid[0]) || (onNewGrid[0][2] != onLastGrid[0][2])) {
                    // element has not the same direction as before
                    // or is the same element (so it must have changed its directions)
                    repaint(onNewGrid[0]);
                }
            } else {
                // more than 1 element
                for (var k = 0; k < onNewGrid.length; k++) {
                    onNewGrid[k][2] = (onNewGrid[k][2] + 1) % 4;
                }

                if ((!onLastGrid) || (onLastGrid.length < 2)) {
                    // before less than 2
                    repaint([i, j, 4]);
                }
            }
        }
    }

    lastGrid = newGrid;
}

/**
 * We clicked on a stone.
 * @param x the stone column index
 * @param y the stone row index.
 */
function clickStone(x, y) {
    var stonesOnPosition = lastGrid[x][y];
    if ((!stonesOnPosition) || (stonesOnPosition.length == 0)) {
        var newStone = [x, y, 0];
        lastGrid[x][y] = [newStone];
        stones.push(newStone);
        repaint(newStone);
    } else if (stonesOnPosition.length == 1) {
        var stone = stonesOnPosition[0];
        stone[2] = (stone[2] + 1) % 5;
        if (stone[2] == 4) {
            // we kill the stone
            // then remove it from the list
            lastGrid[x][y] = null;
            stone[2] = -1;

            var newStones = [];
            for (var i = 0; i < stones.length; i++) {
                if (stones[i][2] != -1) {
                    newStones.push(stone);
                }
            }
            stones = stone;
            repaint(stone);
        } else {
            repaint(stone);
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