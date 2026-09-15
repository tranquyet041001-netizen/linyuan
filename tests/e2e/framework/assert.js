/**
 * Lightweight, robust assertion library for E2E Test Suite
 * Compatible with Node.js ESM
 */

export class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

export const assert = {
  ok(value, message = 'Expected truthy value') {
    if (!value) {
      throw new AssertionError(message, true, value);
    }
  },

  equal(actual, expected, message) {
    if (actual != expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(actual)} == ${JSON.stringify(expected)}`,
        expected,
        actual
      );
    }
  },

  strictEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`,
        expected,
        actual
      );
    }
  },

  notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      throw new AssertionError(
        message || `Expected value not to strictly equal ${JSON.stringify(expected)}`,
        `not ${expected}`,
        actual
      );
    }
  },

  deepEqual(actual, expected, message) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new AssertionError(
        message || `Deep equality mismatch:\nExpected: ${expStr}\nActual:   ${actStr}`,
        expected,
        actual
      );
    }
  },

  includes(container, item, message) {
    if (typeof container === 'string') {
      if (!container.includes(item)) {
        throw new AssertionError(
          message || `Expected string to include "${item}"`,
          item,
          container
        );
      }
    } else if (Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new AssertionError(
          message || `Expected array to include ${JSON.stringify(item)}`,
          item,
          container
        );
      }
    } else if (container && typeof container === 'object') {
      if (!(item in container)) {
        throw new AssertionError(
          message || `Expected object to have property "${item}"`,
          item,
          Object.keys(container)
        );
      }
    } else {
      throw new AssertionError('Target container is neither string, array, nor object', item, container);
    }
  },

  match(text, regex, message) {
    if (typeof text !== 'string' || !regex.test(text)) {
      throw new AssertionError(
        message || `Expected "${text}" to match regex ${regex}`,
        regex.toString(),
        text
      );
    }
  },

  greaterThan(actual, expected, message) {
    if (actual <= expected) {
      throw new AssertionError(
        message || `Expected ${actual} > ${expected}`,
        `> ${expected}`,
        actual
      );
    }
  },

  greaterOrEqual(actual, expected, message) {
    if (actual < expected) {
      throw new AssertionError(
        message || `Expected ${actual} >= ${expected}`,
        `>= ${expected}`,
        actual
      );
    }
  },

  lessThan(actual, expected, message) {
    if (actual >= expected) {
      throw new AssertionError(
        message || `Expected ${actual} < ${expected}`,
        `< ${expected}`,
        actual
      );
    }
  },

  lessOrEqual(actual, expected, message) {
    if (actual > expected) {
      throw new AssertionError(
        message || `Expected ${actual} <= ${expected}`,
        `<= ${expected}`,
        actual
      );
    }
  },

  inRange(val, min, max, message) {
    if (val < min || val > max) {
      throw new AssertionError(
        message || `Expected ${val} to be in range [${min}, ${max}]`,
        `[${min}, ${max}]`,
        val
      );
    }
  },

  throws(fn, expectedRegexOrType, message) {
    let threw = false;
    let err = null;
    try {
      fn();
    } catch (e) {
      threw = true;
      err = e;
    }
    if (!threw) {
      throw new AssertionError(message || 'Expected function to throw an error', 'Error', 'No error thrown');
    }
    if (expectedRegexOrType instanceof RegExp) {
      if (!expectedRegexOrType.test(err.message)) {
        throw new AssertionError(
          message || `Expected error message to match ${expectedRegexOrType}, got: ${err.message}`,
          expectedRegexOrType.toString(),
          err.message
        );
      }
    }
  },

  async rejects(promiseOrFn, expectedRegexOrType, message) {
    let threw = false;
    let err = null;
    try {
      if (typeof promiseOrFn === 'function') {
        await promiseOrFn();
      } else {
        await promiseOrFn;
      }
    } catch (e) {
      threw = true;
      err = e;
    }
    if (!threw) {
      throw new AssertionError(message || 'Expected promise to reject', 'Rejection', 'Resolved cleanly');
    }
    if (expectedRegexOrType instanceof RegExp) {
      if (!expectedRegexOrType.test(err.message)) {
        throw new AssertionError(
          message || `Expected rejection message to match ${expectedRegexOrType}, got: ${err.message}`,
          expectedRegexOrType.toString(),
          err.message
        );
      }
    }
  }
};
