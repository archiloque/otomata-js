$(document).ready(function () {
    var canvas = document.getElementById("playGround");
    if (!canvas.getContext) {
        return;
    }

    var worker;
    var ctx = canvas.getContext('2d');
    var stonesRepaints = [];
    var stones = [];

    ctx.strokeStyle = ctx.fillStyle = '#7E9ACF';
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

    $("#playGroundOver").mouseleave(function () {
        $("#playGroundOver").css({cursor:"default"});
    });
    $("#playGroundOver").mousemove(function (event) {
        if (onStone(event)) {
            $("#playGroundOver").css({cursor:"pointer"});
        } else {
            $("#playGroundOver").css({cursor:"default"});
        }
    });
    $("#playGroundOver").click(function (event) {
        if (onStone(event)) {
            var stoneX = (event.pageX - (event.pageX % Otomata.cellSize)) / Otomata.cellSize;
            var stoneY = (event.pageY - (event.pageY % Otomata.cellSize)) / Otomata.cellSize;
            worker.postMessage(['click', [stoneX, stoneY]]);
        }
    });

    function createTile() {
        tile = document.createElement('canvas');
        tile.height = tile.width = Otomata.cellSize - 4;
        var bufferContext = tile.getContext('2d');
        bufferContext.strokeStyle = bufferContext.fillStyle = 'white';
        bufferContext.fillRect(
            0,
            0,
            Otomata.cellSize - 4,
            Otomata.cellSize - 4
        );
        bufferContext.globalCompositeOperation = "destination-out";
        bufferContext.beginPath();
        bufferContext.moveTo(
            (Otomata.cellSize / 2) - 2,
            (Otomata.cellSize / 4) - 2
        );
        bufferContext.lineTo(
            (3 * Otomata.cellSize / 4) - 2,
            (3 * Otomata.cellSize / 4) - 2
        );
        bufferContext.lineTo(
            (Otomata.cellSize / 4) - 2,
            (3 * Otomata.cellSize / 4) - 2
        );
        bufferContext.closePath();
        bufferContext.fill();
        return tile;
    }

    var cachedTile = createTile();

    function addStone(x, y, i) {
        var canvas = $('<canvas class="stone"/>').appendTo('body');
        canvas.attr('height', (Otomata.cellSize - 4) + "px");
        canvas.attr('width', (Otomata.cellSize - 4) + "px");
        canvas[0].getContext('2d').drawImage(
            cachedTile,
            0,
            0
        );
        stones[i] = canvas;
        canvas.transition({x: (x * Otomata.cellSize), y: (y * Otomata.cellSize)}, 0);
        canvas.fadeIn(50, 'linear');
    }

    function removeStone(i) {
        stones[i].fadeOut(50, 'linear', function(){
            stones[i].detach();
            stones[i] = 0;
        });
    }

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    // update a list of stones
    // each update is represented by an array that indicates the changes to apply to it
    // 0: tile index
    // 1: x position change: specify slot
    // 2: y position change: specify slot
    // 3: rotation (specify degree)
    function updateStones() {
        for (var i = 0; i < stonesRepaints.length; i++) {
            var stone = stonesRepaints[i];
            var params = {};
            if(stone[1] != null) {
                params.x = stone[1] * Otomata.cellSize;
            }
            if(stone[2] != null) {
                params.y = stone[2] * Otomata.cellSize;
            }
            if(stone[3] != null) {
                params.rotate = (stone[3] * 90) + 'deg';
            }
            $(stones[stone[0]]).transition(params, 25, 'ease');
        }
        stonesRepaints = [];
    }

    worker = new Worker("js/otomata.worker.js");
    worker.onmessage = function (event) {
        var action = event.data[0];
        if (action == 'updateStones') {
            stonesRepaints = stonesRepaints.concat(event.data[1]);
            if (requestAnimationFrame) {
                requestAnimationFrame(updateStones);
            } else {
                updateStones();
            }
        } else if (action == 'addStone') {
            addStone(event.data[1][0], event.data[1][1], event.data[1][2]);
        } else if (action == 'removeStone') {
            removeStone(event.data[1]);
        } else if (action == 'playSounds') {
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
