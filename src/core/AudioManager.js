
export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
    }

    playSound(name) {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (name) {
            case 'jump':
                this.playTone(150, 600, 0.1, 'square', 0.1);
                break;
            case 'throw':
                this.playNoise(0.1);
                break;
            case 'swing':
                this.playTone(100, 50, 0.2, 'sawtooth', 0.1);
                break;
            case 'hit':
                this.playTone(100, 50, 0.1, 'square', 0.2);
                this.playNoise(0.1);
                break;
            case 'armor_break':
                this.playTone(800, 100, 0.3, 'sawtooth', 0.2); // "Clang"
                this.playNoise(0.2);
                break;
            case 'switch':
                this.playTone(400, 600, 0.05, 'sine', 0.1);
                break;
            case 'enemy_death':
                this.playTone(200, 50, 0.3, 'sawtooth', 0.15);
                break;
            case 'victory':
                this.playMelody();
                break;
        }
    }

    playTone(startFreq, endFreq, duration, type, vol) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    playMelody() {
        // Victory fanfare (simple)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        let time = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'square';

            gain.gain.setValueAtTime(0.1, time + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time + i * 0.1);
            osc.stop(time + i * 0.1 + 0.3);
        });
    }
}
