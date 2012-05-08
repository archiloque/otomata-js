function sin(x) {
    return Math.sin(x);
}

function cos(x) {
    return Math.cos(x);
}

function exp(x) {
    return Math.exp(x);
}

var PI = Math.PI;

function generateAudio(freq) {
    var samples = [];
    try {
        eval(currentFormula);
    } catch (e) {
    }
    var wave = new RIFFWAVE();
    wave.header.sampleRate = Otomata.sampleRate;
    wave.header.numChannels = 1;
    wave.Make(samples);
    var audio = new Audio();
    audio.src = wave.dataURI;
    audio.load();
    return audio;
}

var allSounds = {};
var currentScaleName = null;
var currentOctave = 0;
var currentSounds = null;
var currentFormula = null;
var defaultFormula = null;

function updateSounds() {
    currentSounds = new Array(Otomata.numberOfCells);
    var scale = Otomata.scales[currentScaleName];
    for (var i = 0; i < Otomata.numberOfCells; i++) {
        var frequency = Otomata.frequencies[scale[i] + (12 * currentOctave)];
        var sound = allSounds[frequency];
        if (!sound) {
            sound = allSounds[frequency] = generateAudio(frequency);
        }
        currentSounds[i] = sound;
    }
}


function setScaleName(scaleName) {
    currentScaleName = scaleName;
    updateSounds();
}

function setDefaultFormula(formula) {
    defaultFormula = formula;
    currentFormula = formula;
}

function getDefaultFormula() {
    return defaultFormula;
}

function setFormula(formula) {
    allSounds = {};
    currentFormula = formula;
    updateSounds();
}

function setOctave(octaveValue) {
    currentOctave = octaveValue;
    updateSounds();
}

function playSound(index) {
    currentSounds[index].play();
}
