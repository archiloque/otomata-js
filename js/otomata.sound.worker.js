importScripts("otomata.constants.js");
importScripts("../external/riffwave.js");

var formula;

self.addEventListener('message', function (e) {
    var messageType = e.data[0];
    if (messageType == 'generateSound') {
        generateSound(e.data[1][0], e.data[1][1]);
    } else if (messageType == 'setFormula') {
        formula = e.data[1][0];
    }

});


function round(x) {
    return Math.round(x);
}

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

function generateSound(frequency, soundIndex) {
    var samples = [];
    try {
        eval(formula);
    } catch (e) {
        self.postMessage(['error', [e.message]]);
        return;
    }
    var wave = new RIFFWAVE();
    wave.header.sampleRate = Otomata.sampleRate;
    wave.header.numChannels = 1;
    wave.Make(samples);
    self.postMessage(['setSound', [soundIndex, wave.dataURI]]);
}
