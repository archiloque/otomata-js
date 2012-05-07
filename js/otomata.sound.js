function generateAudio(freq) {
    var samplesLength = 22050;
    var samples = new Array(samplesLength);
    for (var i = 0; i < samplesLength; i++) {
        var t = i / samplesLength;
        var w = 2 * Math.PI * freq * t;
        var v = Math.cos(w + 8 * Math.sin(w * 1 / 3) * Math.exp(-t * 8));
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
    return audio;
}

var audios = new Array(Otomata.frequencies.length);
var scales = {};
var currentScale = null;

$(document).ready(function () {
    $.each(Otomata.frequencies, function(index, frequency){
       audios[index] = generateAudio(frequency);
    });

    $.each(Otomata.scales, function(name, values){
        v = new Array(Otomata.numberOfCells);
        for(var i = 0; i < Otomata.numberOfCells;i++) {
            v[i] = audios[values[i]];
        }
        scales[name] = v;
    });
});

function setScale(scaleName) {
    currentScale = scales[scaleName];
}

function playSound(index) {
    currentScale[index].play();
}
