/**
 * Full Web Audio API Mock for Stress Testing SakuraAudioEngine
 */

export class MockAudioParam {
  constructor(defaultValue = 1) {
    this.value = defaultValue;
    this.events = [];
  }

  setValueAtTime(value, time) {
    this.value = value;
    this.events.push({ type: 'setValueAtTime', value, time });
  }

  linearRampToValueAtTime(value, time) {
    this.value = value;
    this.events.push({ type: 'linearRampToValueAtTime', value, time });
  }

  exponentialRampToValueAtTime(value, time) {
    this.value = value;
    this.events.push({ type: 'exponentialRampToValueAtTime', value, time });
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.value = target;
    this.events.push({ type: 'setTargetAtTime', target, startTime, timeConstant });
  }

  cancelScheduledValues(startTime) {
    this.events.push({ type: 'cancelScheduledValues', startTime });
  }
}

export class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam(1);
    this.connections = new Set();
    this.isDisconnected = false;
  }

  connect(target) {
    this.connections.add(target);
    this.isDisconnected = false;
  }

  disconnect() {
    this.connections.clear();
    this.isDisconnected = true;
  }
}

export class MockOscillatorNode {
  constructor() {
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
    this.startedAt = null;
    this.stoppedAt = null;
    this.connections = new Set();
    this.isDisconnected = false;
    this.onended = null;
  }

  connect(target) {
    this.connections.add(target);
  }

  start(time = 0) {
    this.startedAt = time;
  }

  stop(time = 0) {
    this.stoppedAt = time;
    if (typeof this.onended === 'function') {
      // Simulate onended callback
      queueMicrotask(() => {
        if (this.onended) this.onended();
      });
    }
  }

  disconnect() {
    this.connections.clear();
    this.isDisconnected = true;
  }
}

export class MockBiquadFilterNode {
  constructor() {
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.connections = new Set();
    this.isDisconnected = false;
  }

  connect(target) {
    this.connections.add(target);
  }

  disconnect() {
    this.connections.clear();
    this.isDisconnected = true;
  }
}

export class MockAudioBuffer {
  constructor(numberOfChannels, length, sampleRate) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      this.channels.push(new Float32Array(length));
    }
  }

  getChannelData(channelIndex) {
    return this.channels[channelIndex] || this.channels[0];
  }
}

export class MockAudioBufferSourceNode {
  constructor() {
    this.buffer = null;
    this.loop = false;
    this.startedAt = null;
    this.stoppedAt = null;
    this.connections = new Set();
    this.isStopped = false;
    this.isDisconnected = false;
  }

  connect(target) {
    this.connections.add(target);
  }

  start(time = 0) {
    this.startedAt = time;
    this.isStopped = false;
  }

  stop(time = 0) {
    this.stoppedAt = time;
    this.isStopped = true;
  }

  disconnect() {
    this.connections.clear();
    this.isDisconnected = true;
  }
}

export class MockAudioContextFull {
  constructor() {
    this.state = 'running';
    this.currentTime = 0.1;
    this.sampleRate = 44100;
    this.destination = { name: 'AudioDestinationNode' };
    this.createdNodes = [];
    this.bufferSources = [];
  }

  createGain() {
    const node = new MockGainNode();
    this.createdNodes.push(node);
    return node;
  }

  createOscillator() {
    const node = new MockOscillatorNode();
    this.createdNodes.push(node);
    return node;
  }

  createBiquadFilter() {
    const node = new MockBiquadFilterNode();
    this.createdNodes.push(node);
    return node;
  }

  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }

  createBufferSource() {
    const node = new MockAudioBufferSourceNode();
    this.createdNodes.push(node);
    this.bufferSources.push(node);
    return node;
  }

  async resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  async suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

export class MockAudioElement {
  constructor() {
    this.src = '';
    this.volume = 1;
    this.loop = false;
    this.crossOrigin = '';
    this.preload = 'auto';
    this.isPlaying = false;
  }

  async play() {
    this.isPlaying = true;
    return Promise.resolve();
  }

  pause() {
    this.isPlaying = false;
  }
}

export function installFullMockAudio() {
  globalThis.AudioContext = MockAudioContextFull;
  globalThis.webkitAudioContext = MockAudioContextFull;
  globalThis.Audio = MockAudioElement;

  if (!globalThis.window) {
    globalThis.window = globalThis;
  }
  globalThis.window.AudioContext = MockAudioContextFull;
  globalThis.window.webkitAudioContext = MockAudioContextFull;
  globalThis.window.Audio = MockAudioElement;
  globalThis.window.location = {
    origin: 'https://sakura-birthday.app',
    pathname: '/',
    hash: '#/',
    search: '',
  };
}
