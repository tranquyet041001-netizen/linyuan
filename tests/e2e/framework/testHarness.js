/**
 * Test Harness for Studio Editor E2E Test Suite
 */

class TestHarness {
  constructor() {
    this.currentSuite = null;
    this.currentTier = 'Uncategorized';
    this.currentFeature = 'General';
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.results = [];
    this.startTime = Date.now();
    this.queue = Promise.resolve();
  }

  setTier(tier) {
    this.currentTier = tier;
  }

  setFeature(feature) {
    this.currentFeature = feature;
  }

  beforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  async describe(title, fn) {
    const prevSuite = this.currentSuite;
    const prevBefore = [...this.beforeEachHooks];
    const prevAfter = [...this.afterEachHooks];

    this.currentSuite = title;
    try {
      await fn();
    } finally {
      this.currentSuite = prevSuite;
      this.beforeEachHooks = prevBefore;
      this.afterEachHooks = prevAfter;
    }
  }

  test(title, fn) {
    const fullTitle = this.currentSuite ? `${this.currentSuite} > ${title}` : title;
    const tier = this.currentTier;
    const feature = this.currentFeature;
    const beHooks = [...this.beforeEachHooks];
    const afHooks = [...this.afterEachHooks];

    this.queue = this.queue.then(async () => {
      const item = {
        title: fullTitle,
        tier,
        feature,
        status: 'pending',
        durationMs: 0,
        error: null
      };

      const start = Date.now();
      try {
        for (const hook of beHooks) {
          await hook();
        }
        await fn();
        item.status = 'passed';
      } catch (err) {
        item.status = 'failed';
        item.error = err;
      } finally {
        for (const hook of afHooks) {
          try {
            await hook();
          } catch (hookErr) {
            console.error(`Error in afterEach hook for "${title}":`, hookErr);
          }
        }
        item.durationMs = Date.now() - start;
        this.results.push(item);
      }
    });

    return this.queue;
  }

  async waitForCompletion() {
    await this.queue;
  }

  it(title, fn) {
    return this.test(title, fn);
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const duration = Date.now() - this.startTime;

    const byTier = {};
    const byFeature = {};

    for (const r of this.results) {
      byTier[r.tier] = byTier[r.tier] || { passed: 0, failed: 0, total: 0 };
      byTier[r.tier].total++;
      if (r.status === 'passed') byTier[r.tier].passed++;
      if (r.status === 'failed') byTier[r.tier].failed++;

      byFeature[r.feature] = byFeature[r.feature] || { passed: 0, failed: 0, total: 0 };
      byFeature[r.feature].total++;
      if (r.status === 'passed') byFeature[r.feature].passed++;
      if (r.status === 'failed') byFeature[r.feature].failed++;
    }

    return {
      total,
      passed,
      failed,
      durationMs: duration,
      byTier,
      byFeature,
      failures: this.results.filter(r => r.status === 'failed')
    };
  }

  reset() {
    this.results = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.startTime = Date.now();
  }
}

export const harness = new TestHarness();
export const describe = harness.describe.bind(harness);
export const test = harness.test.bind(harness);
export const it = harness.it.bind(harness);
export const beforeEach = harness.beforeEach.bind(harness);
export const afterEach = harness.afterEach.bind(harness);
export const setTier = harness.setTier.bind(harness);
export const setFeature = harness.setFeature.bind(harness);
