$(document).ready(function () {
    var canvas = document.getElementById("playGround");
    if (!canvas.getContext) {
        return;
    }

    var stoneStatuses = new Array(Otomata.numberOfCells);
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < Otomata.numberOfCells; i++) {
        stoneStatuses[i] = new Array(Otomata.numberOfCells);
        for (var j = 0; j < Otomata.numberOfCells; j++) {
            stoneStatuses[i][j] = 0;
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
        $("#playGround").css({cursor: "default"});
    });
    $("#playGround").mousemove(function (event) {
        if (onStone(event)) {
            $("#playGround").css({cursor: "pointer"});
        } else {
            $("#playGround").css({cursor: "default"});
        }
    });
    $("#playGround").click(function (event) {
        if (onStone(event)) {
            var stoneX = (event.pageX - (event.pageX % Otomata.cellSize)) / Otomata.cellSize;
            var stoneY = (event.pageY - (event.pageY % Otomata.cellSize)) / Otomata.cellSize;
            var lastStoneStatus = stoneStatuses[stoneX][stoneY];
            var newStoneStatus = (lastStoneStatus + 1) % 5;

            ctx.clearRect(
                (stoneX * Otomata.cellSize) + 2,
                (stoneY * Otomata.cellSize) + 2,
                Otomata.cellSize - 4,
                Otomata.cellSize - 4
            );

            if (newStoneStatus == 1) {
                ctx.beginPath();
                ctx.moveTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 4)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.closePath();
                ctx.fill();
            } else if (newStoneStatus == 2) {
                ctx.beginPath();
                ctx.moveTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 4)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
                );
                ctx.closePath();
                ctx.fill();
            } else if (newStoneStatus == 3) {
                ctx.beginPath();
                ctx.moveTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (3 * Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.closePath();
                ctx.fill();
            } else if (newStoneStatus == 4) {
                ctx.beginPath();
                ctx.moveTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 4)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 4),
                    (stoneY * Otomata.cellSize) + (Otomata.cellSize / 2)
                );
                ctx.lineTo(
                    (stoneX * Otomata.cellSize) + (Otomata.cellSize / 2),
                    (stoneY * Otomata.cellSize) + (3 * Otomata.cellSize / 4)
                );
                ctx.closePath();
                ctx.fill();
            }

            stoneStatuses[stoneX][stoneY] = newStoneStatus;
        }
    });

});
