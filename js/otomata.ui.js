$(document).ready(function () {
    var canvas = document.getElementById("playGround");
    if (!canvas.getContext) {
        return;
    }

    var worker;
    var ctx = canvas.getContext('2d');
    var stonesRepaints = [];

    ctx.strokeStyle = ctx.fillStyle = 'white';
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

    function setStyle(context, hit) {
        if (hit == 1) {
            context.strokeStyle = context.fillStyle = 'red';
        } else if(hit == 2) {
            context.strokeStyle = context.fillStyle = '#7E9ACF';
        } else {
            context.strokeStyle = context.fillStyle = 'white';
        }

    }

    function finish(context, hit) {
        if (hit == 2) {
            context.stroke();
        } else {
            context.fill();
        }

    }

    // prepare the drawing cache
    // drawingCache is an array of array
    // first array contain the normal version
    // second array contain the version when the stone hit a will
    // third array contain the faded versions
    // in each version the drawing are:
    // 0 up, 1 right, 2 down, 3 left, 4 circle, 5 nothing
    var drawingCache = new Array(3);
    {
        for (i = 0; i < 3; i++) {

            drawingCache[i] = new Array(6);
            for (j = 0; j < 6; j++) {
                var buffer = drawingCache[i][j] = document.createElement('canvas');
                buffer.height = buffer.width = Otomata.cellSize - 4;
            }

            var bufferContext;
            {
                bufferContext = drawingCache[i][0].getContext('2d');
                setStyle(bufferContext, i);
                bufferContext.beginPath();
                bufferContext.moveTo(
                    (Otomata.cellSize / 2) - 2,
                    (Otomata.cellSize / 4) - 2
                );
                bufferContext.lineTo(
                    (3 * Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.lineTo(
                    (Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.closePath();
                finish(bufferContext, i);
            }

            {
                bufferContext = drawingCache[i][1].getContext('2d');
                setStyle(bufferContext, i);
                bufferContext.beginPath();
                bufferContext.moveTo(
                    (Otomata.cellSize / 2) - 2,
                    (Otomata.cellSize / 4) - 2
                );
                bufferContext.lineTo(
                    (3 * Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.lineTo(
                    (Otomata.cellSize / 2) - 2,
                    (3 * Otomata.cellSize / 4) - 2
                );
                bufferContext.closePath();
                finish(bufferContext, i);
            }

            {
                bufferContext = drawingCache[i][2].getContext('2d');
                setStyle(bufferContext, i);
                bufferContext.beginPath();
                bufferContext.moveTo(
                    (Otomata.cellSize / 2) - 2,
                    (3 * Otomata.cellSize / 4) - 2
                );
                bufferContext.lineTo(
                    (3 * Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.lineTo(
                    (Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.closePath();
                finish(bufferContext, i);
            }

            {
                bufferContext = drawingCache[i][3].getContext('2d');
                setStyle(bufferContext, i);
                bufferContext.moveTo(
                    (Otomata.cellSize / 2) - 2,
                    (Otomata.cellSize / 4) - 2
                );
                bufferContext.lineTo(
                    (Otomata.cellSize / 4) - 2,
                    (Otomata.cellSize / 2) - 2
                );
                bufferContext.lineTo(
                    (Otomata.cellSize / 2) - 2,
                    (3 * Otomata.cellSize / 4) - 2
                );
                bufferContext.closePath();
                finish(bufferContext, i);
            }

            {
                bufferContext = drawingCache[i][4].getContext('2d');
                setStyle(bufferContext, i);
                bufferContext.beginPath();
                bufferContext.arc(
                    (Otomata.cellSize / 2) - 2,
                    (Otomata.cellSize / 2) - 2,
                    Otomata.cellSize / 3,
                    0,
                    Math.PI * 2);
                bufferContext.closePath();
                finish(bufferContext, i);
            }
        }
    }
    /**
     * Paint the stone
     * @param x the stone column index
     * @param y the stone row index.
     * @param position 0 up, 1 right, 2 down, 3 left, 4 circle, 5 nada
     * @param type 0 normal, 1 hit the wall, 2 faded
     */
    function paintStone(x, y, position, type) {
        ctx.clearRect(
            (x * Otomata.cellSize) + 2,
            (y * Otomata.cellSize) + 2,
            Otomata.cellSize - 4,
            Otomata.cellSize - 4
        );
        if (position < 5) {
            ctx.drawImage(
                drawingCache[type][position],
                (x * Otomata.cellSize) + 2,
                (y * Otomata.cellSize) + 2
            );
        }
    }

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    function repaintStones() {
        for (var i = 0; i < stonesRepaints.length; i++) {
            paintStone(stonesRepaints[i][0], stonesRepaints[i][1], stonesRepaints[i][2], stonesRepaints[i][3])
        }
        stonesRepaints = [];
    }

    worker = new Worker("js/otomata.worker.js");
    worker.onmessage = function (event) {
        var action = event.data[0];
        if (action == 'paint') {
            stonesRepaints = stonesRepaints.concat(event.data[1]);
            if (requestAnimationFrame) {
                requestAnimationFrame(repaintStones);
            } else {
                repaintStones();
            }
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

    $("#scale").click(function () {
        worker.postMessage(['clear']);
        for (var i = 0; i < Otomata.numberOfCells; i++) {
            worker.postMessage(['click', [i, i]]);
        }
        return false;
    });

    var scalesNames = [];
    $.each(Otomata.scales, function (name, values) {
        scalesNames.push(name);
    });
    scalesNames.sort();
    var scalesSelect = "";
    for (i = 0; i < scalesNames.length; i++) {
        scalesSelect += "<option>" + scalesNames[i] + "</option>";
    }
    $("#scales").html(scalesSelect).change(function () {
        setScaleName($("#scales").val());
    });

    var octavesSelect = "";
    for (i = 0; i < Otomata.availableOctaves; i++) {
        if (i == 1) {
            octavesSelect += "<option selected>" + (i + 1) + "</option>";
        } else {
            octavesSelect += "<option>" + (i + 1) + "</option>";
        }
    }
    $("#octaves").html(octavesSelect).change(function () {
        setOctave(parseInt($("#octaves").val()) - 1);
    });

    $("#updateFormula").click(function () {
        setFormula($("#formula").val());
        return false;
    });

    $("#resetFormula").click(function () {
        setFormula($("#formula").val(getDefaultFormula()));
        setFormula(getDefaultFormula());
        return false;
    });

    setDefaultFormula($("#formula").val());
    $("#scales").val("Melodic Minor");
    $("#scales").change();
});
