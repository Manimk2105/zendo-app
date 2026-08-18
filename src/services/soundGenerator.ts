class SoundGenerator {
  private ctx: AudioContext | null = null;
  private rainNode: AudioBufferSourceNode | null = null;
  private rainGainNode: GainNode | null = null;
  private breezeNode: AudioBufferSourceNode | null = null;
  private breezeGainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer(duration: number = 2): AudioBuffer {
    if (!this.ctx) throw new Error("Not initialized");
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  playRain() {
    this.init();
    if (!this.ctx) return;
    this.stopRain();

    try {
      const buffer = this.createNoiseBuffer(3);
      this.rainNode = this.ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      this.rainGainNode = this.ctx.createGain();
      this.rainGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.rainGainNode.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);

      this.rainNode.connect(filter);
      filter.connect(this.rainGainNode);
      this.rainGainNode.connect(this.ctx.destination);

      this.rainNode.start();
    } catch (e) {
      console.error(e);
    }
  }

  stopRain() {
    if (this.rainNode) {
      try {
        this.rainNode.stop();
      } catch (e) {}
      this.rainNode = null;
    }
  }

  playBreeze() {
    this.init();
    if (!this.ctx) return;
    this.stopBreeze();

    try {
      const buffer = this.createNoiseBuffer(4);
      this.breezeNode = this.ctx.createBufferSource();
      this.breezeNode.buffer = buffer;
      this.breezeNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 2.0;
      filter.frequency.value = 400;

      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.value = 0.15;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 200;

      this.lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.breezeGainNode = this.ctx.createGain();
      this.breezeGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.breezeGainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);

      this.breezeNode.connect(filter);
      filter.connect(this.breezeGainNode);
      this.breezeGainNode.connect(this.ctx.destination);

      this.lfo.start();
      this.breezeNode.start();
    } catch (e) {
      console.error(e);
    }
  }

  stopBreeze() {
    if (this.breezeNode) {
      try { this.breezeNode.stop(); } catch (e) {}
      this.breezeNode = null;
    }
    if (this.lfo) {
      try { this.lfo.stop(); } catch (e) {}
      this.lfo = null;
    }
  }

  playBell() {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [150, 300, 451, 602, 755];
      const gains = [0.5, 0.25, 0.15, 0.1, 0.05];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 5.0);
      });
    } catch (e) {
      console.error(e);
    }
  }

  stopAll() {
    this.stopRain();
    this.stopBreeze();
  }
}

export const soundGenerator = new SoundGenerator();
