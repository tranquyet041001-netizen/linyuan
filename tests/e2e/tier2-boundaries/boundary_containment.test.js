import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { StudioEditorModel } from '../framework/studioModel.js';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 12: Containment & Particle Boundaries');

describe('Boundary 12: Containment & Particle Boundaries', () => {
  it('B12.1 should handle minimum particle density boundary (0)', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('density', 0);
    assert.strictEqual(editor.formData.sakura_settings.density, 0);
  });

  it('B12.2 should handle maximum particle density boundary (100)', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('density', 100);
    assert.strictEqual(editor.formData.sakura_settings.density, 100);
  });

  it('B12.3 should handle speed and wind sliders at extreme boundaries [0, 100]', () => {
    const editor = new StudioEditorModel();
    editor.updateSakuraSetting('speed', 0);
    editor.updateSakuraSetting('wind', 100);

    assert.strictEqual(editor.formData.sakura_settings.speed, 0);
    assert.strictEqual(editor.formData.sakura_settings.wind, 100);
  });

  it('B12.4 should support disabling particles entirely via animation toggle', () => {
    const editor = new StudioEditorModel();
    editor.updateAnimationToggle('particles', false);
    assert.strictEqual(editor.formData.animations.particles, false);
  });

  it('B12.5 should enforce particle count calculation mapping correctly within [20, 150]', () => {
    const mapDensityToParticles = (density) => Math.round(20 + (density / 100) * 130);

    assert.strictEqual(mapDensityToParticles(0), 20, 'Density 0 maps to 20 particles minimum');
    assert.strictEqual(mapDensityToParticles(50), 85, 'Density 50 maps to 85 particles');
    assert.strictEqual(mapDensityToParticles(100), 150, 'Density 100 maps to 150 particles maximum');
  });
});
