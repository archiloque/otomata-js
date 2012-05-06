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

});
