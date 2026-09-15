import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 11: Device Frame Switcher Mockups');

describe('Feature 11: Device Frame Switcher Mockups', () => {
  const rootDir = process.cwd();

  it('11.1 should support switching preview device between desktop and mobile', () => {
    const editor = new StudioEditorModel();
    assert.strictEqual(editor.previewDevice, 'desktop', 'Default preview device should be desktop');

    editor.setPreviewDevice('mobile');
    assert.strictEqual(editor.previewDevice, 'mobile');

    editor.setPreviewDevice('desktop');
    assert.strictEqual(editor.previewDevice, 'desktop');
  });

  it('11.2 should render titanium styling and dynamic island / notch elements in mobile mockup', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.includes(content, "previewDevice === 'mobile'", 'Component must branch on previewDevice mobile');
    assert.includes(content, 'rounded-[48px]', 'Mobile frame must have realistic phone rounded corners');
    assert.includes(content, 'max-w-[420px]', 'Mobile frame should be constrained to realistic width');
  });

  it('11.3 should render macOS traffic light dots (rose, amber, emerald) and URL bar in desktop mockup', () => {
    const filePath = path.join(rootDir, 'src', 'pages', 'CreateBirthday.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.includes(content, 'bg-rose-500', 'Desktop window mockup must have red dot');
    assert.includes(content, 'bg-amber-500', 'Desktop window mockup must have yellow dot');
    assert.includes(content, 'bg-emerald-500', 'Desktop window mockup must have green dot');
    assert.includes(content, 'sakura-birthday.app/birthday/', 'Desktop mockup must render simulated URL bar');
  });

  it('11.4 should preserve exact form data inside both mobile and desktop frames', () => {
    const editor = new StudioEditorModel();
    editor.updateField('name', 'Fujiwara Chika');
    editor.updateField('slug', 'chika-bday');

    editor.setPreviewDevice('mobile');
    assert.strictEqual(editor.previewState.renderedName, 'Fujiwara Chika');

    editor.setPreviewDevice('desktop');
    assert.strictEqual(editor.previewState.renderedName, 'Fujiwara Chika');
  });

  it('11.5 should reject invalid preview device identifiers', () => {
    const editor = new StudioEditorModel();
    assert.throws(
      () => editor.setPreviewDevice('tablet_smart_tv'),
      /Invalid preview device/
    );
  });
});
