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
    var samplesLength = 22050;
    var samples = new Array(samplesLength);
    for (var i = 0; i < samplesLength; i++) {
        var t = i / samplesLength;  // time from 0 to 1
        var w = 2 * Math.PI * freq * t;
        var v = cos(w + 3 * sin(w / 3) * exp(-t));
        v *= Math.exp(-t * 3);
        v = 128 + Math.round(127 * v);
        samples[i] = v;
    }

    var wave = new RIFFWAVE();
    wave.header.sampleRate = 22050;
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

function setOctave(octaveValue) {
    currentOctave = octaveValue;
    updateSounds();
}

function playSound(index) {
    currentSounds[index].play();
}
