/**
 * Mock Browser Environment for Headless E2E Tests
 */

export class MockLocalStorage {
  constructor(quotaBytes = 5 * 1024 * 1024) {
    this.store = new Map();
    this.quotaBytes = quotaBytes;
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    const valStr = String(value);
    let currentBytes = 0;
    for (const [k, v] of this.store.entries()) {
      if (k !== key) currentBytes += (k.length + v.length) * 2;
    }
    const newBytes = currentBytes + (key.length + valStr.length) * 2;
    if (newBytes > this.quotaBytes) {
      const err = new Error('QuotaExceededError: DOM Exception 22');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.store.set(key, valStr);
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

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

  setTargetAtTime(value, time, constant) {
    this.value = value;
    this.events.push({ type: 'setTargetAtTime', value, time, constant });
  }

  cancelScheduledValues(time) {
    this.events.push({ type: 'cancelScheduledValues', time });
  }
}

export class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam(1);
    this.connectedTo = null;
  }

  connect(target) {
    this.connectedTo = target;
  }

  disconnect() {
    this.connectedTo = null;
  }
}

export class MockOscillatorNode {
  constructor() {
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
    this.startedAt = null;
    this.stoppedAt = null;
    this.connectedTo = null;
    this.onended = null;
  }

  connect(target) {
    this.connectedTo = target;
  }

  start(time = 0) {
    this.startedAt = time;
  }

  stop(time = 0) {
    this.stoppedAt = time;
    if (typeof this.onended === 'function') {
      queueMicrotask(() => {
        if (this.onended) this.onended();
      });
    }
  }

  disconnect() {
    this.connectedTo = null;
  }
}

export class MockBiquadFilterNode {
  constructor() {
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.connectedTo = null;
  }

  connect(target) {
    this.connectedTo = target;
  }

  disconnect() {
    this.connectedTo = null;
  }
}

export class MockAudioBuffer {
  constructor(numberOfChannels = 1, length = 44100, sampleRate = 44100) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channels = [new Float32Array(length)];
  }

  getChannelData() {
    return this.channels[0];
  }
}

export class MockAudioBufferSourceNode {
  constructor() {
    this.buffer = null;
    this.loop = false;
    this.connectedTo = null;
    this.startedAt = null;
    this.stoppedAt = null;
    this.isStopped = false;
  }

  connect(target) {
    this.connectedTo = target;
  }

  start(time = 0) {
    this.startedAt = time;
  }

  stop(time = 0) {
    this.stoppedAt = time;
    this.isStopped = true;
  }

  disconnect() {
    this.connectedTo = null;
  }
}

export class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0.1;
    this.sampleRate = 44100;
    this.destination = { name: 'AudioDestinationNode' };
    this.createdNodes = [];
    this.suspended = false;
  }

  createGain() {
    const gain = new MockGainNode();
    this.createdNodes.push(gain);
    return gain;
  }

  createOscillator() {
    const osc = new MockOscillatorNode();
    this.createdNodes.push(osc);
    return osc;
  }

  createBiquadFilter() {
    const filter = new MockBiquadFilterNode();
    this.createdNodes.push(filter);
    return filter;
  }

  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }

  createBufferSource() {
    const source = new MockAudioBufferSourceNode();
    this.createdNodes.push(source);
    return source;
  }

  suspend() {
    this.state = 'suspended';
    this.suspended = true;
    return Promise.resolve();
  }

  resume() {
    this.state = 'running';
    this.suspended = false;
    return Promise.resolve();
  }

  close() {
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
    this.paused = true;
  }

  async play() {
    this.isPlaying = true;
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.isPlaying = false;
    this.paused = true;
  }
}

export class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.style = {};
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.value = '';
    this.innerHTML = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'class') this.className = String(value);
    if (name === 'value') this.value = String(value);
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  querySelector(selector) {
    // Simple tag / class matcher
    const match = (node) => {
      if (selector.startsWith('.') && node.className.includes(selector.slice(1))) return node;
      if (node.tagName.toLowerCase() === selector.toLowerCase()) return node;
      for (const child of node.children) {
        const found = match(child);
        if (found) return found;
      }
      return null;
    };
    return match(this);
  }
}

export class MockDocument {
  constructor() {
    this.body = new MockDOMElement('body');
  }

  createElement(tagName) {
    return new MockDOMElement(tagName);
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

export function createMockBrowser(options = {}) {
  const localStorage = new MockLocalStorage(options.storageQuota);
  const location = {
    origin: 'https://sakura-birthday.app',
    pathname: '/',
    hash: '#/create',
    search: '',
    href: 'https://sakura-birthday.app/#/create',
    assign(url) { this.href = url; }
  };

  const win = {
    innerWidth: options.innerWidth || 1280,
    innerHeight: options.innerHeight || 800,
    localStorage,
    location,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    Audio: MockAudioElement,
    document: new MockDocument(),
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    requestAnimationFrame: (cb) => globalThis.setTimeout(() => cb(Date.now()), 16),
    cancelAnimationFrame: (id) => globalThis.clearTimeout(id),
    navigator: { userAgent: 'NodeTestRunner' },
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  return win;
}

let originalGlobals = null;

export function installMockBrowser(options = {}) {
  const mockWin = createMockBrowser(options);
  if (!originalGlobals) {
    originalGlobals = {
      window: globalThis.window,
      document: globalThis.document,
      localStorage: globalThis.localStorage,
      AudioContext: globalThis.AudioContext,
      webkitAudioContext: globalThis.webkitAudioContext,
      Audio: globalThis.Audio
    };
  }

  globalThis.window = mockWin;
  globalThis.document = mockWin.document;
  globalThis.localStorage = mockWin.localStorage;
  globalThis.AudioContext = mockWin.AudioContext;
  globalThis.webkitAudioContext = mockWin.webkitAudioContext;
  globalThis.Audio = mockWin.Audio;

  return mockWin;
}

export function cleanupMockBrowser() {
  if (originalGlobals) {
    globalThis.window = originalGlobals.window;
    globalThis.document = originalGlobals.document;
    globalThis.localStorage = originalGlobals.localStorage;
    globalThis.AudioContext = originalGlobals.AudioContext;
    globalThis.webkitAudioContext = originalGlobals.webkitAudioContext;
    globalThis.Audio = originalGlobals.Audio;
    originalGlobals = null;
  }
}
