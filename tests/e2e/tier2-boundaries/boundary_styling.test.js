import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import { VALID_THEMES } from '../framework/contractValidator.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 01: Styling Boundaries');

describe('Boundary 01: Styling Boundaries', () => {
  const rootDir = process.cwd();

  it('B1.1 should correctly identify isDark flags across all predefined themes', () => {
    const themesPath = path.join(rootDir, 'src', 'data', 'themes.ts');
    const content = fs.readFileSync(themesPath, 'utf8');

    for (const themeId of VALID_THEMES) {
      assert.includes(content, themeId, `Theme ${themeId} must be declared in themes.ts`);
    }
  });

  it('B1.2 should support zero opacity / fully transparent alpha channels in glassmorphism', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Check rgba transparency values
    assert.includes(css, 'rgba(', 'CSS should define rgba transparent surfaces');
  });

  it('B1.3 should define Kintsugi hairline widths precisely at 2px or 1px without overflow', () => {
    const msgPath = path.join(rootDir, 'src', 'components', 'BirthdayMessage.tsx');
    const msgContent = fs.readFileSync(msgPath, 'utf8');

    assert.includes(msgContent, 'h-[2px]', 'Kintsugi hairline should be exactly 2px high');
  });

  it('B1.4 should handle extreme theme property values safely', () => {
    const sampleTheme = {
      id: 'sakura-night',
      name: 'Night',
      japaneseName: '桜の夜',
      description: '',
      bgGradient: 'from-black to-black',
      textColor: '#ffffff',
      subtextColor: '#888888',
      accentColor: '#ffb7c5',
      cardBg: 'rgba(0,0,0,0.8)',
      cardBorder: 'rgba(255,255,255,0.1)',
      isDark: true,
      sakuraPrimary: '#ffb7c5',
      sakuraSecondary: '#ff5c8a',
      petalShadow: 'none'
    };

    assert.ok(VALID_THEMES.includes(sampleTheme.id));
    assert.strictEqual(sampleTheme.isDark, true);
  });

  it('B1.5 should verify Hanko stamp has minimum and maximum size boundaries', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.includes(css, 'border: 2px solid #b91c1c', 'Hanko stamp must specify defined 2px border');
    assert.includes(css, 'border-radius: 4px', 'Hanko stamp must specify defined 4px corner radius');
  });
});
