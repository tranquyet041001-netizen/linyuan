import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 01: Neo-Japanese Cyber-Zen Styling');

describe('Feature 01: Neo-Japanese Cyber-Zen Styling', () => {
  const rootDir = process.cwd();

  it('1.1 should define frosted glassmorphism CSS classes with backdrop blur and border tokens', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert.includes(cssContent, '.glass-panel', 'Expected .glass-panel class in index.css');
    assert.includes(cssContent, 'backdrop-filter: blur', 'Expected backdrop-filter blur in index.css');
    assert.includes(cssContent, 'border: 1px solid', 'Expected translucent border definition');
  });

  it('1.2 should define Kintsugi gold hairline accents and color tokens in Tailwind configuration', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.js');
    const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');

    assert.includes(tailwindContent, 'gold:', 'Expected gold color token in tailwind.config.js');
    assert.includes(tailwindContent, 'dfb76c', 'Expected #dfb76c Kintsugi gold hex code');
    assert.includes(tailwindContent, 'shimmer', 'Expected shimmer animation token');
  });

  it('1.3 should define traditional Hanko cinnabar seal stamp style with rotation and border', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert.includes(cssContent, '.hanko-stamp', 'Expected .hanko-stamp class in index.css');
    assert.includes(cssContent, '#b91c1c', 'Expected #b91c1c red color in Hanko stamp');
    assert.includes(cssContent, 'rotate(-4deg)', 'Expected authentic rotate angle in Hanko stamp');
  });

  it('1.4 should define authentic washi paper texture styles for day and dark modes', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert.includes(cssContent, '.washi-card', 'Expected .washi-card texture definition');
    assert.includes(cssContent, '.washi-card-dark', 'Expected .washi-card-dark texture definition');
    assert.includes(cssContent, 'radial-gradient', 'Expected radial gradient for washi paper fiber effect');
  });

  it('1.5 should include required Japanese and luxury serif typography in font definitions', () => {
    const indexHtmlPath = path.join(rootDir, 'index.html');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const tailwindPath = path.join(rootDir, 'tailwind.config.js');
    const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');

    assert.includes(indexHtml, 'Shippori+Mincho', 'Expected Shippori Mincho font loaded in index.html');
    assert.includes(indexHtml, 'Noto+Serif+JP', 'Expected Noto Serif JP font loaded in index.html');
    assert.includes(tailwindContent, 'japanese:', 'Expected japanese font family mapping');
    assert.includes(tailwindContent, 'cinzel:', 'Expected cinzel font family mapping');
  });
});
