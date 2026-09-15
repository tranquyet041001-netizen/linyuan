import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 03: Split-Screen Desktop Layout');

describe('Feature 03: Split-Screen Desktop Layout', () => {
  const rootDir = process.cwd();

  it('3.1 should recognize desktop mode when viewport width is >= 1024px', () => {
    const editor = new StudioEditorModel();
    editor.setViewportWidth(1280);
    assert.strictEqual(editor.isDesktop(), true, '1280px should be recognized as desktop');

    editor.setViewportWidth(1024);
    assert.strictEqual(editor.isDesktop(), true, '1024px exactly is the desktop threshold');
  });

  it('3.2 should implement dual-column flex-row layout in CreateBirthday component', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.includes(content, 'lg:flex-row', 'Desktop layout must establish flex-row layout on lg screens');
    assert.includes(content, 'flex-1', 'Container must be flex-1 to occupy full available vertical space');
  });

  it('3.3 should enforce independent scrollable container on left pane with fixed sidebar width', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    // Sidebar width is constrained and scrollable
    assert.match(content, /w-full lg:w-\[(480px|520px)\]/, 'Left sidebar should define dedicated width on lg screens');
    assert.includes(content, 'overflow-', 'Pane must define dedicated overflow handling');
  });

  it('3.4 should configure right preview pane to expand with flex-1 and center the preview viewport', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.includes(content, 'flex items-center justify-center', 'Preview pane must center the device mockup');
  });

  it('3.5 should define a fixed 64px studio navbar header with actions', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.match(content, /h-(16|\[64px\])/, 'Navbar must be 64px high');
    assert.match(content, /calc\(100vh\s*-\s*64px\)/, 'Split-screen pane height must deduct 64px header');
  });
});
