import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const page = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const script = page.match(/<script>\s*(const rose = [\s\S]*?)<\/script>/)[1];
const { outputText } = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } });

for (const seekFrames of [1, 5]) test(`rose settles and resumes with ${seekFrames}-frame seeks`, () => {
  const frames = new Map(), listeners = {};
  let id = 0, now = 0, top = 1000, remaining = 0, time = 0, seeks = 0;
  const reduced = { matches: false, addEventListener: (_, callback) => { listeners.motion = callback; } };
  const rose = {
    duration: 20, readyState: 1, pause() {},
    get seeking() { return remaining > 0; },
    get currentTime() { return Math.round(time * 10) / 10; },
    set currentTime(value) { assert.equal(remaining, 0, 'do not interrupt an active seek'); time = value; remaining = seekFrames; seeks++; },
    getBoundingClientRect: () => ({ top, bottom: top + 400, height: 400 }),
  };
  runInNewContext(outputText, {
    document: { querySelector: () => rose }, matchMedia: () => reduced, innerHeight: 1000,
    IntersectionObserver: class { observe() {} },
    window: { addEventListener: (name, callback) => { listeners[name] = callback; } },
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
  });
  const settle = () => {
    for (let i = 0; i < 300 && (frames.size || remaining); i++) {
      remaining = Math.max(0, remaining - 1);
      now += 1000 / 60;
      const pending = [...frames.values()]; frames.clear();
      pending.forEach(callback => callback(now));
    }
    assert.equal(frames.size, 0, 'animation must stop scheduling frames');
    assert.equal(remaining, 0, 'final seek must finish');
  };
  settle();
  top = 400; listeners.scroll(); settle();
  assert.equal(time, 18);
  const idleSeeks = seeks;
  listeners.scroll(); settle();
  assert.equal(seeks, idleSeeks, 'unchanged scroll position must not seek again');
  top = 800; listeners.scroll(); settle();
  assert.ok(time > 0 && time < 18, 'scrolling again must update the video');
  reduced.matches = true; listeners.motion(); settle();
  assert.equal(time, 18, 'reduced motion must settle on the bloomed frame');
});
