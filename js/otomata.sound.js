function generateAudio(freq) {
    var samplesLength = 22050;
    var samples = new Array(samplesLength);
    for (var i = 0; i < samplesLength; i++) {
        var t = i / samplesLength;
        var w = 2 * Math.PI * freq * t;
        samples[i] = Math.cos(w + 8 * Math.sin(w * 7 / 8) * Math.exp(-t * 4));
        samples[i] *= Math.exp(-t * 3);
        samples[i] = 128 + Math.round(127 * samples[i]);
    }

    var wave = new RIFFWAVE();
    wave.header.sampleRate = 22050;
    wave.header.numChannels = 1;
    wave.Make(samples);
    var audio = new Audio();
    audio.src = wave.dataURI;
    return audio;
}

var audios = {};

function playTone(freq) {
    var audio = audios[freq];
    if (!audio) {
        audio = generateAudio(freq);
        audios[freq] = audio;
    }
    audio.play();
}

for (i = 0; i < 9; i++) {
    audios[220 * i] = generateAudio(250 * i);
}

function playSound(index) {
    playTone(250 * index);
}
