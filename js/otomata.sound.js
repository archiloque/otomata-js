// cached sounds for a formula, indexed by their frequency
var cachedSoundsForFormula = {};

var currentScaleName = null;
var currentOctave = 0;

// the worker
var soundWorker;

// the current sounds, array with cell index
var currentSounds = new Array(Otomata.numberOfCells);

// default formula
var defaultFormula = null;

$(document).ready(function () {
    soundWorker = new Worker("js/otomata.sound.worker.js");
    soundWorker.onmessage = function (event) {
        var action = event.data[0];
        if (action == 'setSound') {
            setSound(event.data[1][0], event.data[1][1]);
        }
    };

});

function setSound(soundIndex, soundUri) {
    var audio = new Audio();
    audio.src = soundUri;
    audio.load();
    currentSounds[soundIndex] = audio;
}

function updateSounds() {
    var scale = Otomata.scales[currentScaleName];
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        var frequency = Otomata.frequencies[scale[i] + (12 * currentOctave)];
        var sound = cachedSoundsForFormula[frequency];
        if(sound) {
            currentSounds[i] = sound;
        } else {
            soundWorker.postMessage(['generateSound', [frequency, i]]);
        }
    }
}


function setScaleName(scaleName) {
    currentScaleName = scaleName;
    updateSounds();
}

function setDefaultFormula(formula) {
    defaultFormula = formula;
    soundWorker.postMessage(['setFormula', [formula]]);
}

function getDefaultFormula() {
    return defaultFormula;
}

function setFormula(formula) {
    // evict the cache
    cachedSoundsForFormula = {};
    soundWorker.postMessage(['setFormula', [formula]]);
    updateSounds();
}

function setOctave(octave) {
    currentOctave = octave;
    updateSounds();
}

function playSound(index) {
    if(currentSounds[index]) {
        currentSounds[index].play();
    }
}
