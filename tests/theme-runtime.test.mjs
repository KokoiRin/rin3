import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const runtimePath = new URL('../public/theme.js', import.meta.url);

class FakeEventTarget {
  listeners = new Map();

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event) {
    event.target ??= this;
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) ?? []) {
      listener.call(this, event);
    }
    return true;
  }
}

class FakeElement extends FakeEventTarget {
  constructor(tagName) {
    super();
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.style = {
      setProperty(name, value) { this[name] = String(value); },
      removeProperty(name) { delete this[name]; },
    };
    this.dataset = new Proxy({}, {
      get: (_, key) => this.getAttribute(`data-${String(key).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`) ?? undefined,
      set: (_, key, value) => {
        this.setAttribute(`data-${String(key).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`, value);
        return true;
      },
    });
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  querySelectorAll(selector) {
    const matches = [];
    const visit = element => {
      for (const child of element.children ?? []) {
        const matchesTag = selector === child.tagName?.toLowerCase();
        const matchesClass = selector.startsWith('.') && (child.className ?? '').split(/\s+/).includes(selector.slice(1));
        if (matchesTag || matchesClass) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

function boot({ stored = null, systemDark = false, failRead = false, failWrite = false } = {}) {
  const storage = new Map(stored === null ? [] : [['rin-theme', stored]]);
  const localStorage = {
    getItem(key) {
      if (failRead) throw new Error('Storage read blocked');
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      if (failWrite) throw new Error('Storage write blocked');
      storage.set(key, String(value));
    },
    removeItem(key) {
      if (failWrite) throw new Error('Storage write blocked');
      storage.delete(key);
    },
  };
  const media = new FakeEventTarget();
  media.matches = systemDark;
  media.media = '(prefers-color-scheme: dark)';
  media.addListener = listener => media.addEventListener('change', listener);
  media.removeListener = listener => media.removeEventListener('change', listener);
  const document = new FakeEventTarget();
  document.readyState = 'loading';
  document.documentElement = new FakeElement('html');
  document.head = new FakeElement('head');
  document.body = new FakeElement('body');
  document.documentElement.append(document.head, document.body);
  document.createElement = tag => new FakeElement(tag);
  document.createTextNode = text => ({ textContent: String(text) });
  document.querySelector = selector => {
    if (selector.startsWith('meta')) return null;
    return document.documentElement.querySelector(selector);
  };
  document.querySelectorAll = selector => document.documentElement.querySelectorAll(selector);
  document.getElementById = id => {
    const visit = node => node.id === id || node.getAttribute?.('id') === id
      ? node
      : (node.children ?? []).map(visit).find(Boolean);
    return visit(document.documentElement) ?? null;
  };
  const changes = [];
  document.addEventListener('rin-theme-change', event => changes.push(event.detail));
  const sandbox = new FakeEventTarget();
  Object.assign(sandbox, {
    document,
    localStorage,
    matchMedia: () => media,
    CustomEvent: class {
      constructor(type, options = {}) { this.type = type; Object.assign(this, options); }
    },
    console,
    setTimeout,
    clearTimeout,
  });
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.runInNewContext(readFileSync(runtimePath, 'utf8'), sandbox, { filename: runtimePath.pathname });
  return {
    api: sandbox.RinTheme,
    root: document.documentElement,
    document,
    changes,
    storage,
    systemChange(dark) {
      media.matches = dark;
      media.dispatchEvent({ type: 'change', matches: dark, media: media.media });
    },
    remotePreference(value, key = 'rin-theme') {
      const oldValue = storage.get(key) ?? null;
      if (value === null) storage.delete(key);
      else storage.set(key, value);
      sandbox.dispatchEvent({ type: 'storage', key, oldValue, newValue: value, storageArea: localStorage });
    },
  };
}

function expectTheme(env, preference, theme) {
  assert.equal(env.api.getPreference(), preference);
  assert.equal(env.api.getResolvedTheme(), theme);
  assert.equal(env.root.getAttribute('data-theme-preference'), preference);
  assert.equal(env.root.getAttribute('data-theme'), theme);
}

test('saved dark preference is applied before DOMContentLoaded, even when the system is light', () => {
  const env = boot({ stored: 'dark' });
  expectTheme(env, 'dark', 'dark');
  assert.equal(env.document.readyState, 'loading');
});

test('default system preference follows changes in both directions', () => {
  const env = boot();
  expectTheme(env, 'system', 'light');
  env.systemChange(true);
  expectTheme(env, 'system', 'dark');
  assert.equal(env.changes.at(-1).preference, 'system');
  assert.equal(env.changes.at(-1).theme, 'dark');
  env.systemChange(false);
  expectTheme(env, 'system', 'light');
});

test('explicit light and dark preferences survive system changes; returning to system uses its current value', () => {
  const env = boot({ systemDark: true });
  env.api.setPreference('light');
  expectTheme(env, 'light', 'light');
  env.systemChange(false);
  env.systemChange(true);
  expectTheme(env, 'light', 'light');
  env.api.setPreference('dark');
  env.systemChange(false);
  expectTheme(env, 'dark', 'dark');
  env.api.setPreference('system');
  expectTheme(env, 'system', 'light');
});

test('changing the preference persists it and announces the resulting state', () => {
  const env = boot();
  env.api.setPreference('dark');
  assert.equal(env.storage.get('rin-theme'), 'dark');
  expectTheme(env, 'dark', 'dark');
  assert.equal(env.changes.at(-1).preference, 'dark');
  assert.equal(env.changes.at(-1).theme, 'dark');
  const reload = boot({ stored: env.storage.get('rin-theme') });
  expectTheme(reload, 'dark', 'dark');
});

test('cross-tab preference changes and removal update the current page; unrelated keys do not', () => {
  const env = boot({ systemDark: true });
  env.remotePreference('light');
  expectTheme(env, 'light', 'light');
  env.remotePreference('dark');
  expectTheme(env, 'dark', 'dark');
  env.remotePreference('light', 'unrelated-setting');
  expectTheme(env, 'dark', 'dark');
  env.remotePreference(null);
  expectTheme(env, 'system', 'dark');
});

test('unavailable storage does not prevent initialization or in-page switching', () => {
  const env = boot({ failRead: true, failWrite: true, systemDark: true });
  expectTheme(env, 'system', 'dark');
  assert.doesNotThrow(() => env.api.setPreference('light'));
  expectTheme(env, 'light', 'light');
  assert.doesNotThrow(() => env.api.setPreference('dark'));
  expectTheme(env, 'dark', 'dark');
  assert.doesNotThrow(() => env.api.setPreference('system'));
  expectTheme(env, 'system', 'dark');
});

test('invalid saved, API and remote values fall back to system', () => {
  const env = boot({ stored: 'unexpected', systemDark: true });
  expectTheme(env, 'system', 'dark');
  env.api.setPreference('light');
  env.api.setPreference('invalid');
  expectTheme(env, 'system', 'dark');
  env.api.setPreference('light');
  env.remotePreference('invalid');
  expectTheme(env, 'system', 'dark');
});

test('mounted control exposes all three named choices with the current preference selected', () => {
  const env = boot({ stored: 'dark' });
  const container = env.document.createElement('div');
  env.api.mountControl(container);
  const select = container.querySelector('select');
  assert.ok(select, 'mounting should add a select');
  assert.equal(select.getAttribute('aria-label'), '外观');
  assert.equal(select.value, 'dark');
  assert.deepEqual(select.children.map(option => [option.value, option.textContent]), [
    ['light', '浅色'], ['dark', '深色'], ['system', '跟随系统'],
  ]);
});

test('mounting twice in the same container does not duplicate the control', () => {
  const env = boot();
  const container = env.document.createElement('div');
  env.api.mountControl(container);
  env.api.mountControl(container);
  assert.equal(container.querySelectorAll('select').length, 1);
});

test('multiple mounted controls stay synchronized after user, API and cross-tab changes', () => {
  const env = boot();
  const containers = [env.document.createElement('div'), env.document.createElement('div')];
  containers.forEach(container => env.api.mountControl(container));
  const controls = containers.map(container => container.querySelector('select'));
  controls[0].value = 'dark';
  controls[0].dispatchEvent({ type: 'change' });
  expectTheme(env, 'dark', 'dark');
  assert.equal(env.storage.get('rin-theme'), 'dark');
  assert.deepEqual(controls.map(control => control.value), ['dark', 'dark']);
  env.remotePreference('light');
  assert.deepEqual(controls.map(control => control.value), ['light', 'light']);
  env.api.setPreference('system');
  env.systemChange(true);
  expectTheme(env, 'system', 'dark');
  assert.deepEqual(controls.map(control => control.value), ['system', 'system']);
});
