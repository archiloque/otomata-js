var worker;

$(document).ready(function () {
    var canvas = document.getElementById("playGround");
    if (!canvas.getContext) {
        return;
    }

    var ctx = canvas.getContext('2d');

    for (var i = 0; i < Otomata.numberOfCells; i++) {
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            ctx.fillRect(
                (i * Otomata.cellSize) + 1,
                (j * Otomata.cellSize) + 1,
                Otomata.cellSize - 2,
                Otomata.cellSize - 2
            );
            ctx.clearRect(
                (i * Otomata.cellSize) + 2,
                (j * Otomata.cellSize) + 2,
                Otomata.cellSize - 4,
                Otomata.cellSize - 4
            );
        }
    }

    function onStone(event) {
        var x = event.pageX % Otomata.cellSize;
        var y = event.pageY % Otomata.cellSize;
        return ((x >= 2) && (x <= (Otomata.cellSize - 2)) && (y >= 2) && (y <= (Otomata.cellSize - 2)));
    }

    $("#playGround").mouseleave(function () {
        $("#playGround").css({cursor:"default"});
    });
    $("#playGround").mousemove(function (event) {
        if (onStone(event)) {
            $("#playGround").css({cursor:"pointer"});
        } else {
            $("#playGround").css({cursor:"default"});
        }
    });
    $("#playGround").click(function (event) {
        if (onStone(event)) {
            var stoneX = (event.pageX - (event.pageX % Otomata.cellSize)) / Otomata.cellSize;
            var stoneY = (event.pageY - (event.pageY % Otomata.cellSize)) / Otomata.cellSize;
            worker.postMessage(['click', [stoneX, stoneY]]);
        }
    });

    /**
     * Paint the stone
     * @param x the stone column index
     * @param y the stone row index.
     * @param status 0 up, 1 right, 2 down, 3 left, 4 circle, -1 nada
     */
    function paintStone(x, y, status) {

        ctx.clearRect(
            (x * Otomata.cellSize) + 2,
            (y * Otomata.cellSize) + 2,
            Otomata.cellSize - 4,
            Otomata.cellSize - 4
        );

        if (status == 0) {
            ctx.beginPath();
            ctx.moveTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (Otomata.cellSize / 4)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.closePath();
            ctx.fill();
        } else if (status == 1) {
            ctx.beginPath();
            ctx.moveTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (Otomata.cellSize / 4)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
            );
            ctx.closePath();
            ctx.fill();
        } else if (status == 2) {
            ctx.beginPath();
            ctx.moveTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.closePath();
            ctx.fill();
        } else if (status == 3) {
            ctx.beginPath();
            ctx.moveTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (Otomata.cellSize / 4)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 4),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2)
            );
            ctx.lineTo(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
            );
            ctx.closePath();
            ctx.fill();
        } else if (status == 4) {
            ctx.beginPath();
            ctx.arc(
                (x * Otomata.cellSize) + (Otomata.cellSize / 2),
                (y * Otomata.cellSize) + (Otomata.cellSize / 2),
                Otomata.cellSize / 3,
                0,
                Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    worker = new Worker("js/otomata.worker.js");
    worker.onmessage = function (event) {
        var action = event.data[0];
        if (action == 'paint') {
            paintStone(event.data[1][0], event.data[1][1], event.data[1][2]);
        } else if (action == 'sound') {
            playSound(event.data[1]);
        } else if (action == 'log') {
            console.log(event.data[1]);
        }
    };
    worker.postMessage(['init']);

    var running = false;

    $("#start").click(function () {
        if (running) {
            worker.postMessage(['stop']);
            $("#start").text('Start')
        } else {
            worker.postMessage(['start']);
            $("#start").text('Stop')
        }
        running = !running;
        return false;
    });
    $("#clear").click(function () {
        worker.postMessage(['clear']);
        return false;
    });


});
